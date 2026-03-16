from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from typing import Literal
import uvicorn
import uuid
import os, time
import cv2
import numpy as np

from app.models import get_model, predict_fog_class
from app.dehaze import dehaze_dcp, dark_channel_prior
from app.utils import ensure_dir, save_image_bgr, laplacian_focus_measure
from app.config import settings
from app.analytics import log_event, compute_stats, read_events  # <-- NEW

app = FastAPI(title="Adaptive Fog API", version="1.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.FILES_DIR, exist_ok=True)
app.mount("/files", StaticFiles(directory=settings.FILES_DIR), name="files")

@app.get("/health")
def health():
    return {"ok": True}

Variant = Literal["high", "medium"]

@app.post("/api/infer")
async def infer_image(
    request: Request,
    file: UploadFile = File(...),
    variant: Variant = Form("high"),
):
    run_id = str(uuid.uuid4())[:8]
    run_dir = os.path.join(settings.FILES_DIR, f"run_{run_id}")
    ensure_dir(run_dir)

    raw = await file.read()
    np_arr = np.frombuffer(raw, np.uint8)
    bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if bgr is None:
        raise HTTPException(status_code=400, detail="Could not read image.")
    orig_path = os.path.join(run_dir, "original.png")
    save_image_bgr(orig_path, bgr)

    try:
        model, transform, class_names = get_model(variant)
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))

    t0 = time.perf_counter()
    pred_class, confidence = predict_fog_class(model, transform, class_names, bgr)
    lap_var = laplacian_focus_measure(bgr)
    fog_detected = (lap_var < 350) or (confidence > 0.45)

    if fog_detected:
        dehazed_bgr, dark_vis = dehaze_dcp(bgr, omega=0.95, t0=0.1, win=15)
    else:
        dehazed_bgr = bgr.copy()
        dark = dark_channel_prior(bgr.astype(np.float64) / 255.0, window=15)
        dark_vis = (dark * 255).astype(np.uint8)

    dehazed_path = os.path.join(run_dir, "dehazed.png")
    dark_path = os.path.join(run_dir, "dark.png")
    save_image_bgr(dehazed_path, dehazed_bgr)
    cv2.imwrite(dark_path, dark_vis)

    processing_ms = int((time.perf_counter() - t0) * 1000)

    base = str(request.base_url).rstrip("/")
    dehazed_url = f"{base}/files/run_{run_id}/dehazed.png"
    dark_url = f"{base}/files/run_{run_id}/dark.png"

    # --- NEW: append analytics log
    log_event({
        "id": run_id,
        "file_name": file.filename or "upload",
        "fog_detected": bool(fog_detected),
        "fog_class": pred_class,
        "confidence": float(confidence),
        "processing_ms": processing_ms,
        "ts": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "variant": variant,
    })

    return JSONResponse(
        {
            "fog_detected": bool(fog_detected),
            "fog_class": pred_class,
            "confidence": float(confidence),
            "dehazed_url": dehazed_url,
            "dark_channel_url": dark_url,
            "download_url": dehazed_url,
            "id": run_id,
            "processing_ms": processing_ms,
        }
    )

# NEW: stats + recent endpoints
@app.get("/api/stats")
def get_stats():
    return compute_stats()

@app.get("/api/recent")
def get_recent(limit: int = Query(20, ge=1, le=200)):
    return {"items": read_events(limit=limit)}

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
