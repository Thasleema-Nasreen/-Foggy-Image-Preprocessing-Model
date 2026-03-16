import os
import cv2
import numpy as np

def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)

def save_image_bgr(path: str, bgr: np.ndarray):
    ok = cv2.imwrite(path, bgr)
    if not ok:
        raise RuntimeError(f"Failed to write image: {path}")

def laplacian_focus_measure(img_bgr) -> float:
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())
