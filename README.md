# 🌿Smart Polyhouse AI Dashboard & Rover

## 🏆3rd Prize Winner - CHIP TO CROP Agritech Hackathon | Team Neural Hackers

A fully autonomous "Digital Twin" rover and monitoring system for smart agriculture. This project integrates a physical Raspberry Pi rover, real-time environmental sensing, and Edge AI to detect plant diseases and automate soil health analysis.

## 📸 Deployed Output

### Rover
<img width="500" alt="image" src="https://github.com/Armaanmd/smart-polyhouse-ai-monitor/blob/main/rover.jpg" />

[![Dashboard](https://github.com/Armaanmd/smart-polyhouse-ai-monitor/blob/main/live%20demo%20dashboard%20.mp4)]

📖 **Overview**

Farmers today face unpredictable yields due to a lack of real-time data. We built an end-to-end solution that doesn't just monitor—it acts.

Our system consists of a 4-wheel rover that autonomously navigates polyhouse rows, collecting granular data (Temperature, Humidity, Soil Moisture) and capturing video feeds. A custom-trained AI model processes this feed in real-time to detect diseases (like on Hibiscus leaves) and alerts the farmer via a React-based dashboard.

🚀 **Key Features**

🤖 Autonomous Navigation: Custom-coded movement logic for tight rows, including obstacle avoidance using Ultrasonic & IR sensors.

🧠 Edge AI Disease Detection: Runs a custom TensorFlow/Keras model locally on the Raspberry Pi to classify plants as "Healthy" or "Diseased" with 96% accuracy.

⚡ Real-Time Telemetry: Uses WebSockets to stream sensor data and camera frames to the frontend with <500ms latency.

🚨 Proactive Yield Threats: The system analyzes trends and automatically suggests "Actionable Precautions" (e.g., "Activate Misters") when heat stress or disease is detected.

🎮 Remote Override: Manual control tab to drive the rover remotely via the web interface.

🏗️ **System Architecture**

Code snippet

graph LR
    A[Sensors & Camera] -->|GPIO/CSI| B(Raspberry Pi 4)
    B -->|Process Data| C{FastAPI Backend}
    C -->|WebSocket Stream| D[React Dashboard]
    C -->|TensorFlow| E[AI Model]
    E -->|Predictions| C
    
🛠️ **Tech Stack**

Software
Backend: Python 3.11, FastAPI, Uvicorn, WebSockets

Frontend: React.js, Recharts, Lucide-React

AI & ML: TensorFlow, Keras, OpenCV (cv2), NumPy

Embedded: RPi.GPIO, gpiozero, picamera2

Hardware
Controller: Raspberry Pi 4 Model B

Sensors: DHT22 (Temp/Humidity), Capacitive Soil Moisture, HC-SR04 (Ultrasonic), IR Sensor.

Actuators: 4x DC Motors with L298N Motor Driver.

Power: 12V Li-ion Battery Pack + 5V Power Bank for Pi.

⚙️ **Installation & Setup**
Prerequisites
Node.js & npm installed.

Python 3.10+ installed.

1.**Clone the Repository**
Bash

git clone https://github.com/Armaanmd/smart-polyhouse-ai-monitor.git
cd smart-polyhouse-ai-monitor

2. **Backend Setup**
Bash

cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

3. **Frontend Setup**
Bash

cd frontend
npm install
npm start
The dashboard will launch at http://localhost:3000

👥 Team Neural Hackers
Mohd Armaan Z - Developer & Backend Architect
Patrick John - Frontend & UI/UX Design
Prathiban S - Hardware Integration & Robotics
Dushyant M - Hardware Integration & Robotics
