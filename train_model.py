"""
Standalone ML Model Training & Checkpoint Generator.
Trains the Vision Grader (RandomForest Classifier on hand-crafted multi-channel color & texture features)
across all 7 produce defect categories, computes accuracy and confusion matrix,
and serializes the trained checkpoint for the backend and prototype engines.
"""

import sys
import pickle
from pathlib import Path
import numpy as np

ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(ROOT_DIR / "prototype") not in sys.path:
    sys.path.insert(0, str(ROOT_DIR / "prototype"))

from data.loaders import synthetic_images, CONDITIONS
from vision.grader import Grader

def train_and_export_model():
    print("=" * 65)
    print("      AI-POWERED E-MANDI VISION MODEL TRAINING PIPELINE      ")
    print("=" * 65)
    
    print("\n[1/4] Generating training and validation dataset...")
    images, labels = synthetic_images(n_per_class=120, seed=42)
    print(f"  -> Total dataset size: {len(images)} images")
    print(f"  -> Classes ({len(CONDITIONS)}): {', '.join(CONDITIONS)}")
    
    print("\n[2/4] Fitting Computer Vision Random Forest Grader Model...")
    grader = Grader(seed=42)
    grader.fit(images, labels)
    
    test_acc = grader.test_acc_
    print(f"  -> Model Training & Evaluation Complete!")
    print(f"  -> Out-of-Sample Test Accuracy: {test_acc * 100:.2f}%")
    print(f"  -> Number of Estimators: {grader.clf.n_estimators}")
    print(f"  -> Number of Extracted Features: {grader.clf.n_features_in_}")
    
    print("\n[3/4] Model Confusion Matrix (Row: True, Col: Pred):")
    cm = grader.cm_
    header = "          " + " ".join([f"{c[:6]:>7}" for c in grader.classes_])
    print(header)
    for idx, row in enumerate(cm):
        row_str = f"{grader.classes_[idx][:8]:<10}" + " ".join([f"{val:7.2f}" for val in row])
        print(row_str)
        
    print("\n[4/4] Serializing model checkpoints...")
    # 1. Backend checkpoint path
    backend_model_dir = ROOT_DIR / "backend" / "models"
    backend_model_dir.mkdir(parents=True, exist_ok=True)
    backend_checkpoint = backend_model_dir / "grader_checkpoint.pkl"
    
    with open(backend_checkpoint, "wb") as f:
        pickle.dump(grader, f)
    print(f"  -> Saved backend checkpoint: {backend_checkpoint}")
    
    # 2. Prototype outputs checkpoint path
    proto_model_dir = ROOT_DIR / "prototype" / "outputs"
    proto_model_dir.mkdir(parents=True, exist_ok=True)
    proto_checkpoint = proto_model_dir / "grader_checkpoint.pkl"
    
    with open(proto_checkpoint, "wb") as f:
        pickle.dump(grader, f)
    print(f"  -> Saved prototype checkpoint: {proto_checkpoint}")
    
    print("\n" + "=" * 65)
    print(" SUCCESS: ML Vision Model trained and ready for live production!")
    print("=" * 65)

if __name__ == "__main__":
    train_and_export_model()
