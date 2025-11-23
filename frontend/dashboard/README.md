# 🌿 Smart Polyhouse AI Dashboard & Rover

**Chip to Crop Hackathon**

An end-to-end IoT and AI system designed for smart farming. This project integrates a physical rover, real-time environmental monitoring, and Edge AI to detect plant diseases and provide actionable yield-saving insights.

![Dashboard Screenshot](path-to-your-dashboard-screenshot.png)

## 🚀 Key Features
* **Autonomous Rover:** Custom-built 4-wheel chassis with obstacle avoidance and soil probing capabilities.
* **Edge AI Disease Detection:** Custom-trained TensorFlow model running on Raspberry Pi to detect Hibiscus leaf diseases in real-time.
* **Live Telemetry:** WebSocket-based dashboard displaying Temperature, Humidity, Soil Moisture, and Live Camera Feed with <1s latency.
* **Proactive Alerts:** "Yield Threat" engine that suggests specific chemical/physical interventions when risks are detected.

## 🛠️ Tech Stack
* **Hardware:** Raspberry Pi 4, L298N Motor Drivers, Pi Camera, DHT22, Capacitive Soil Moisture Sensor.
* **Backend:** Python, FastAPI, WebSockets, RPi.GPIO.
* **AI/ML:** TensorFlow, Keras, OpenCV.
* **Frontend:** React.js, Recharts, Lucide-React.

## ⚙️ Installation

### Backend (Raspberry Pi)
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

### Frontend (Workstation)
```bash

cd frontend
npm install
npm start

