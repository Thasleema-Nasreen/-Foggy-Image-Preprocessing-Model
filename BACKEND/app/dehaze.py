import numpy as np
import cv2

def dark_channel_prior(img_float, window=15):
    """
    Expects float image in [0,1] (H,W,3). Returns 2D dark channel (H,W).
    """
    if img_float.dtype != np.float64 and img_float.dtype != np.float32:
        I = img_float.astype(np.float64) / 255.0
    else:
        I = img_float
    min_img = np.min(I, axis=2)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (window, window))
    dark = cv2.erode(min_img, kernel)
    return dark

def dehaze_dcp(img_bgr, omega=0.95, t0=0.1, win=15):
    I = img_bgr.astype(np.float64) / 255.0
    dark = dark_channel_prior(I, window=win)
    A = np.max(I)  # simple atmospheric light estimate (scalar)
    t = 1 - omega * (dark / (A + 1e-9))
    t = np.clip(t, t0, 1.0)
    t3 = np.repeat(t[:, :, np.newaxis], 3, axis=2)
    J = (I - A) / t3 + A
    J = np.clip(J, 0, 1.0)
    return (J * 255).astype(np.uint8), (dark * 255).astype(np.uint8)
