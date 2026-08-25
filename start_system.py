import subprocess
import sys
import time
import os
import signal
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "finalfrontend2026"

def main():
    print("=" * 65)
    print("      AI-POWERED E-MANDI FULL-STACK APPLICATION LAUNCHER      ")
    print("      SIH Problem Statement ID 26031 — DoCA Onion Grading      ")
    print("=" * 65)

    # 1. Start FastAPI Backend Server (Port 8000)
    print("\n[1/2] Starting FastAPI Backend Server (Port 8000)...")
    backend_cmd = [sys.executable, str(BACKEND_DIR / "run_server.py")]
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=str(BACKEND_DIR),
        creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == 'nt' else 0
    )

    time.sleep(2)

    # 2. Start Vite Frontend Server
    print("\n[2/2] Starting React / Vite Web Frontend...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=str(FRONTEND_DIR),
        creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == 'nt' else 0
    )

    print("\n" + "=" * 65)
    print(" SUCCESS! System active:")
    print("   -> Backend API:      http://localhost:8000/api/v1")
    print("   -> Swagger API Docs: http://localhost:8000/docs")
    print("   -> Web App Portal:   http://localhost:8443 or http://localhost:5173")
    print(" Press Ctrl+C in this terminal to stop both servers.")
    print("=" * 65 + "\n")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down backend and frontend servers...")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    main()
