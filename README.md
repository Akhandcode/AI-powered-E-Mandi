# 🌾 AI-Powered E-Mandi

An end-to-end intelligent agricultural commodities grading, pricing estimation, and e-mandi platform built for precision agricultural assessment and transparent trade.

---

## 🚀 Features

- **Automated AI Grading & Vision Assessment**: Computer vision & ML-powered quality estimation for agricultural produce (size measurement, defect detection, and grade classification).
- **Intelligent Pricing Engine**: Real-time market forecasts, bayesian lot quality estimation, and mandi price routing based on Agmarknet standards.
- **Modern Responsive Portal**: Full-featured React + Vite web application for inspectors, traders, and farmers.
- **FastAPI Backend Architecture**: High-performance RESTful API with automated Swagger docs (`/docs`).
- **One-Click Startup**: Launch both frontend and backend synchronously with a single command.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite, Lucide Icons
- **Backend**: Python 3.10+, FastAPI, Uvicorn, SQLite
- **AI / ML**: OpenCV, Scikit-learn, NumPy, Pandas

---

## ⚡ Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Run the Full Stack App
```bash
python start_system.py
```

### 3. Or Run Manually in Separate Terminals

#### Backend:
```bash
cd backend
python run_server.py
```
* Backend API: `http://localhost:8000/api/v1`
* Interactive API Docs: `http://localhost:8000/docs`

#### Frontend:
```bash
cd finalfrontend2026
npm install
npm run dev
```
* Web Portal: `http://localhost:8443` (or `http://localhost:5173`)

---

## 📁 Project Structure

```text
├── backend/            # FastAPI backend server & endpoints
│   ├── app/            # Core API logic, DB models, services
│   └── run_server.py   # Backend server runner
├── data/               # Agmarknet price datasets and data loaders
├── finalfrontend2026/  # React + TypeScript + Vite frontend
├── lot/                # Bayesian lot quality estimators
├── pricing/            # Market price forecasting and mandi routing
├── vision/             # AI grading & image assessment models
├── start_system.py     # Unified launcher script
└── README.md
```
