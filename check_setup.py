"""
Run this FIRST.

    python check_setup.py

It tells you whether your computer is ready to run the project, in plain English.
It does not change anything -- it only looks and reports.
"""
import importlib
import platform
import sys

REQUIRED = {
    "numpy": "numpy",
    "pandas": "pandas",
    "sklearn": "scikit-learn",
    "skimage": "scikit-image",
    "matplotlib": "matplotlib",
}

GREEN, RED, YELLOW, BOLD, END = "\033[92m", "\033[91m", "\033[93m", "\033[1m", "\033[0m"


def ok(m):    print(f"  {GREEN}[OK]{END}   {m}")
def bad(m):   print(f"  {RED}[FAIL]{END} {m}")
def warn(m):  print(f"  {YELLOW}[WARN]{END} {m}")


def main():
    print(f"\n{BOLD}VegGrade-Price -- setup check{END}")
    print("=" * 52)

    print(f"\n{BOLD}1. Python version{END}")
    v = sys.version_info
    print(f"  You have Python {v.major}.{v.minor}.{v.micro} on {platform.system()}")
    if v.major == 3 and v.minor >= 9:
        ok("Version is fine (need 3.9 or newer).")
    else:
        bad("Too old. Install Python 3.9+ from python.org, then re-run this.")
        return 1

    print(f"\n{BOLD}2. Required packages{END}")
    missing = []
    for module, pipname in REQUIRED.items():
        try:
            m = importlib.import_module(module)
            ver = getattr(m, "__version__", "?")
            ok(f"{pipname:<14} {ver}")
        except ImportError:
            bad(f"{pipname:<14} NOT INSTALLED")
            missing.append(pipname)

    if missing:
        print(f"\n{BOLD}  How to fix:{END}")
        print("  Copy-paste this into your terminal, press Enter, wait:\n")
        print(f"      pip install {' '.join(missing)}\n")
        print("  If 'pip' is not recognised, try 'pip3' or 'python -m pip' instead.")
        print("  Then run  python check_setup.py  again.")
        return 1

    print(f"\n{BOLD}3. Quick functional test{END}")
    try:
        import numpy as np
        from data.loaders import synthetic_images
        from vision.grader import extract_features
        imgs, labels = synthetic_images(n_per_class=2, seed=0)
        f = extract_features(imgs[0])
        ok(f"Generated {len(imgs)} test images, extracted {len(f)} features each.")
    except Exception as e:
        bad(f"Something broke: {type(e).__name__}: {e}")
        print("\n  Most likely cause: you are not running this from inside the")
        print("  'prototype' folder. Use 'cd' to go there first, then re-run.")
        return 1

    print("\n" + "=" * 52)
    print(f"{GREEN}{BOLD}  Everything is ready.{END}\n")
    print(f"  Next, run:   {BOLD}python run_pipeline.py --fast{END}")
    print("  That takes about 30 seconds and creates outputs/report.html\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
