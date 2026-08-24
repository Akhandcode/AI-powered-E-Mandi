"""
STAGE A -- the grader.

SEAM #2 -------------------------------------------------------------------
This is a colour/texture-histogram + RandomForest classifier. It is a
PLACEHOLDER for a fine-tuned CNN (MobileNetV3 / EfficientNet-B0).

To swap in the real thing, implement one class with this interface:

    class Grader:
        classes_: list[str]
        def predict_proba(self, images) -> np.ndarray   # (N, K)

and nothing downstream changes. `confusion_matrix_normalised()` must also be
provided -- Stage B uses it to de-bias observed counts.
---------------------------------------------------------------------------
"""
from __future__ import annotations

import numpy as np
from skimage.color import rgb2hsv, rgb2gray
from skimage.feature import local_binary_pattern
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split


def extract_features(img: np.ndarray) -> np.ndarray:
    """Hand-crafted colour + texture descriptor. A CNN replaces this entirely."""
    x = img.astype(np.float32) / 255.0
    hsv = rgb2hsv(x)
    gray = rgb2gray(x)

    feats = []
    # colour histograms (H, S, V) -- captures ripeness and discolouration
    for ch in range(3):
        h, _ = np.histogram(hsv[:, :, ch], bins=16, range=(0, 1), density=True)
        feats.append(h)
    # per-channel moments
    for ch in range(3):
        c = x[:, :, ch]
        feats.append([c.mean(), c.std(), np.percentile(c, 10), np.percentile(c, 90)])
    # dark-pixel fraction at several thresholds -- rot / boreholes read as dark
    feats.append([(gray < t).mean() for t in (0.15, 0.25, 0.35, 0.45)])
    # LBP texture histogram -- mould/fungal patches change local texture
    lbp = local_binary_pattern((gray * 255).astype(np.uint8), P=8, R=1, method="uniform")
    lh, _ = np.histogram(lbp, bins=10, range=(0, 10), density=True)
    feats.append(lh)
    # simple gradient energy -- surface roughness proxy
    gy, gx = np.gradient(gray)
    feats.append([np.sqrt(gx**2 + gy**2).mean(), np.sqrt(gx**2 + gy**2).std()])

    return np.concatenate([np.atleast_1d(f).ravel() for f in feats])


class Grader:
    def __init__(self, seed=0):
        self.clf = RandomForestClassifier(
            n_estimators=350, min_samples_leaf=2, n_jobs=-1, random_state=seed
        )
        self.classes_: list[str] = []
        self.report_: str = ""
        self.cm_: np.ndarray | None = None
        self.test_acc_: float = float("nan")

    def fit(self, images, labels, seed=0):
        X = np.array([extract_features(i) for i in images])
        y = np.array(labels)
        Xtr, Xte, ytr, yte = train_test_split(
            X, y, test_size=0.25, stratify=y, random_state=seed
        )
        self.clf.fit(Xtr, ytr)
        self.classes_ = list(self.clf.classes_)
        pred = self.clf.predict(Xte)
        self.test_acc_ = float((pred == yte).mean())
        self.report_ = classification_report(yte, pred, zero_division=0)
        # rows = true class, cols = predicted class, row-normalised
        cm = confusion_matrix(yte, pred, labels=self.classes_).astype(float)
        self.cm_ = cm / cm.sum(axis=1, keepdims=True).clip(min=1e-9)
        return self

    def predict_proba(self, images) -> np.ndarray:
        X = np.array([extract_features(i) for i in images])
        return self.clf.predict_proba(X)

    def confusion_matrix_normalised(self) -> np.ndarray:
        """P(predicted = j | true = i). Stage B inverts this to de-bias counts."""
        return self.cm_
