# Adaptive Fog Backend (FastAPI + PyTorch + OpenCV)

## Endpoints
- `GET /health` → `{ "ok": true }`
- `POST /api/infer` (multipart)
  - `file`: image
  - `variant`: `"high"` (ResNet50) or `"medium"` (MobileNetV2)
  - **200 JSON**:
    ```json
    {
      "fog_detected": true,
      "fog_class": "dark",
      "confidence": 0.924,
      "dehazed_url": "/files/run_ab12cd34/dehazed.png",
      "dark_channel_url": "/files/run_ab12cd34/dark.png",
      "download_url": "/files/run_ab12cd34/dehazed.png"
    }
    ```

## Models
Place trained weights in `./models/`:

- High accuracy (ResNet50): `models/resnet50_fog.pt`  
- Medium accuracy (MobileNetV2): `models/mobilenetv2_fog.pt` (optional)

To export from your Colab training:
```python
# after training your PyTorch model with 4 classes:
torch.save(model.state_dict(), "resnet50_fog.pt")
# or mobile:
torch.save(model.state_dict(), "mobilenetv2_fog.pt")



#Installing process:
 python -m venv .venv 

 .venv\\Scripts\\activate

 pip install -r requirements.txt

 uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload