import os
from typing import Tuple, List
import json

import torch
import torch.nn as nn
from torchvision import models, transforms
import cv2
import numpy as np

from app.config import settings

# Lazy singletons
_model_cache = {
    "high": None,    # (model, transform, class_names)
    "medium": None,
}
_class_names_cache: List[str] | None = None


def _build_resnet50(num_classes: int = 4) -> nn.Module:
    model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
    in_f = model.fc.in_features
    model.fc = nn.Linear(in_f, num_classes)
    model.eval()
    return model


def _build_mobilenet_v2(num_classes: int = 4) -> nn.Module:
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V2)
    in_f = model.classifier[-1].in_features
    model.classifier[-1] = nn.Linear(in_f, num_classes)
    model.eval()
    return model


def _default_transform():
    return transforms.Compose([
        transforms.ToPILImage(),
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])


def _load_weights_or_raise(model: nn.Module, path: str):
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Model weights not found: {path}. "
            f"Please place your trained .pt file there. "
            f"(Tip: export from Colab with torch.save(..., '{path}'))"
        )
    state = torch.load(path, map_location="cpu")
    model.load_state_dict(state, strict=True)


def _load_class_names() -> List[str]:
    """
    Try to load class_names.json produced by Colab training.
    Falls back to the canonical alphabetical order if missing.
    """
    global _class_names_cache
    if _class_names_cache is not None:
        return _class_names_cache

    json_path = os.path.join(settings.MODELS_DIR, "class_names.json")
    if os.path.exists(json_path):
        try:
            with open(json_path, "r") as f:
                names = json.load(f)
            if isinstance(names, list) and len(names) == 4 and all(isinstance(x, str) for x in names):
                _class_names_cache = names
                return _class_names_cache
        except Exception:
            pass

    # Safe default that matches torchvision ImageFolder alphabetical behavior
    _class_names_cache = ["dark", "homogeneous", "inhomogeneous", "sky"]
    return _class_names_cache


def get_model(variant: str) -> Tuple[nn.Module, transforms.Compose, List[str]]:
    """
    Returns (model, transform, class_names) for 'high' (ResNet50) or 'medium' (MobileNetV2).
    """
    assert variant in ("high", "medium")
    if _model_cache[variant] is None:
        class_names = _load_class_names()

        if variant == "high":
            model = _build_resnet50(num_classes=len(class_names))
            weights_path = os.path.join(settings.MODELS_DIR, "resnet50_fog.pt")
        else:
            model = _build_mobilenet_v2(num_classes=len(class_names))
            weights_path = os.path.join(settings.MODELS_DIR, "mobilenetv2_fog.pt")

        _load_weights_or_raise(model, weights_path)
        _model_cache[variant] = (model, _default_transform(), class_names)

    return _model_cache[variant]


@torch.inference_mode()
def predict_fog_class(model, transform, class_names, bgr) -> tuple[str, float]:
    """
    Returns predicted class label and confidence (0..1) using softmax probability.
    """
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    x = transform(rgb).unsqueeze(0)
    logits = model(x)
    prob = torch.softmax(logits, dim=1).cpu().numpy()[0]
    cls_id = int(np.argmax(prob))
    return class_names[cls_id], float(prob[cls_id])
