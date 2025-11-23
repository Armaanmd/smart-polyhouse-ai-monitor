#!/bin/bash
# Deploy script to send code to Raspberry Pi

RPI_IP="192.168.43.191"  # Change to your Raspberry Pi IP
RPI_USER="prathi@Hackathon"

echo "Deploying to Raspberry Pi..."

# Copy backend code
scp -r backend/app $RPI_USER@$RPI_IP:/home/pi/polyhouse/

# Copy requirements
scp backend/requirements_rpi.txt $RPI_USER@$RPI_IP:/home/pi/polyhouse/

echo "Deployment complete!"
echo "SSH into Pi and run: cd /home/pi/polyhouse && source venv/bin/activate && pip install -r requirements_rpi.txt && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"