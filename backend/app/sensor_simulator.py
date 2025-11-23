import random
import time
import base64
from datetime import datetime
from PIL import Image
import io
import numpy as np
from .video_simulator import video_simulator

class MockSensorData:
    def __init__(self):
        self.problem_mode = None
        self.motor_speeds = {1: 0, 2: 0, 3: 0, 4: 0}
        
        # Start video simulator
        video_simulator.start()
        
    def trigger_problem(self, problem_type: str):
        self.problem_mode = problem_type
        print(f"🎭 Mock: Triggered problem '{problem_type}'")
        
        # Add visual overlay for disease simulation
        if problem_type == 'detect_disease':
            video_simulator.add_overlay_text(
                "⚠️ DISEASE DETECTED: Powdery Mildew", 
                (50, 50), 
                (0, 0, 255)
            )
            video_simulator.highlight_disease_region((150, 180, 200, 150))
        elif problem_type == 'detect_pest':
            video_simulator.add_overlay_text(
                "🐛 PESTS DETECTED: Aphids (42 count)",
                (50, 50),
                (0, 165, 255)
            )
    
    def clear_problem(self):
        self.problem_mode = None
        print("✅ Mock: Cleared all problems")
    
    def get_all_data(self):
        # Base values
        temp = 24.0 + random.uniform(-2, 2)
        humidity = 65.0 + random.uniform(-5, 5)
        soil_moisture = 70.0 + random.uniform(-3, 3)
        water_level = 35.0 + random.uniform(-2, 2)
        
        # Apply problem scenarios
        if self.problem_mode == 'high_temperature':
            temp += 10
        elif self.problem_mode == 'high_humidity':
            humidity += 20
        elif self.problem_mode == 'low_humidity':
            humidity -= 25
        elif self.problem_mode == 'low_soil_moisture':
            soil_moisture -= 30
        elif self.problem_mode == 'high_soil_moisture':
            soil_moisture += 20
        
        # Get camera frame from video simulator
        camera_frame = video_simulator.get_frame_base64()
        
        return {
            "timestamp": datetime.now().isoformat(),
            "greenhouse_id": "GH001-SIMULATOR",
            "temperature_internal": round(temp, 1),
            "temperature_external": round(temp - 3 + random.uniform(-1, 1), 1),
            "temperature_soil": round(temp - 2 + random.uniform(-1, 1), 1),
            "humidity": round(max(0, min(100, humidity)), 1),
            "soil_moisture": round(max(0, min(100, soil_moisture)), 1),
            "water_level_cm": round(max(0, water_level), 1),
            "motion_detected": random.choice([True, False]) if random.random() > 0.8 else False,
            "light_par": round(600 + random.uniform(-100, 100), 1),
            "co2_level": round(420 + random.uniform(-20, 20), 1),
            "soil_ph": round(6.2 + random.uniform(-0.2, 0.2), 1),
            "soil_ec": round(1.8 + random.uniform(-0.1, 0.1), 1),
            "motor_statuses": self.motor_speeds.copy(),
            "camera_frame_base64": camera_frame
        }
    
    def control_motor(self, motor_id: int, direction: str, speed: int):
        print(f"🎭 Mock Motor {motor_id}: {direction} at {speed}%")
        self.motor_speeds[motor_id] = speed if direction != 'stop' else 0
    
    def stop_all_motors(self):
        self.motor_speeds = {1: 0, 2: 0, 3: 0, 4: 0}
        print("🎭 Mock: All motors stopped")