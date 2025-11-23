# FILE: backend/app/sensor_integration.py

import time
from datetime import datetime
import numpy as np
from .config import IS_RPI # Use the central config file to check the platform

# This block is crucial: it only imports hardware libraries if on the Pi
if IS_RPI:
    import RPi.GPIO as GPIO
    import board
    import adafruit_dht
    import picamera
    from gpiozero import DistanceSensor, MotionSensor, LED
else:
    # If not on a Pi, create "dummy" objects so the code doesn't crash
    print("⚠️  Running in simulation mode. Hardware libraries not imported.")
    GPIO, board, adafruit_dht, picamera, DistanceSensor, MotionSensor, LED = (None,)*7

class PinConfig:
    """GPIO Pin configuration using BCM numbering"""
    DHT_PIN = board.D4 if IS_RPI else 4  # GPIO 4
    ULTRASONIC_TRIG = 27
    ULTRASONIC_ECHO = 22
    IR_SENSOR_PIN = 23
    LED_RED = 24
    LED_YELLOW = 25
    LED_GREEN = 26

class DHT22Sensor:
    def __init__(self, pin=PinConfig.DHT_PIN):
        self.sensor = None
        self.last_temp, self.last_humidity = 25.0, 65.0 # Default fallback values
        if IS_RPI:
            try:
                self.sensor = adafruit_dht.DHT22(pin, use_pulseio=False)
                print("✅ DHT22 sensor initialized.")
            except Exception as e:
                print(f"❌ ERROR initializing DHT22: {e}")
    def read(self):
        if not self.sensor: return self.last_temp, self.last_humidity
        try:
            temp, hum = self.sensor.temperature, self.sensor.humidity
            if temp is not None and hum is not None:
                self.last_temp, self.last_humidity = temp, hum
        except RuntimeError:
            print("⚠️ DHT22 read error, using last known value.")
        return round(self.last_temp, 1), round(self.last_humidity, 1)

class UltrasonicSensor:
    def __init__(self, trig=PinConfig.ULTRASONIC_TRIG, echo=PinConfig.ULTRASONIC_ECHO):
        self.sensor_obj = None
        self.last_distance = 30.0
        if IS_RPI:
            try:
                self.sensor_obj = DistanceSensor(echo=echo, trigger=trig)
                print("✅ Ultrasonic sensor initialized.")
            except Exception as e:
                print(f"❌ ERROR initializing Ultrasonic sensor: {e}")
    def read(self):
        if not self.sensor_obj: return self.last_distance
        try:
            # gpiozero returns distance in meters, convert to cm
            self.last_distance = self.sensor_obj.distance * 100
        except Exception:
             print("⚠️ Ultrasonic read error, using last known value.")
        return round(self.last_distance, 1)

# You would add other real sensor classes here (IRSensor, LEDIndicator, etc.)

class CameraModule:
    def __init__(self):
        self.camera = None
        if IS_RPI:
            try:
                self.camera = picamera.PiCamera()
                self.camera.resolution = (640, 480)
                time.sleep(2) # Camera warm-up time
                print("✅ Camera module initialized.")
            except Exception as e:
                print(f"❌ ERROR initializing Camera: {e}")

    def capture_frame_bytes(self):
        if not self.camera: return None
        from io import BytesIO
        stream = BytesIO()
        self.camera.capture(stream, format='jpeg', use_video_port=True)
        stream.seek(0)
        return stream.getvalue()

class SensorDataAggregator:
    def __init__(self):
        print("🔧 Initializing Real Sensor Aggregator for Raspberry Pi...")
        self.dht22 = DHT22Sensor()
        self.ultrasonic = UltrasonicSensor()
        self.camera = CameraModule()
        # Initialize other sensor classes here

    def get_all_sensor_data(self):
        temp, humidity = self.dht22.read()
        water_level = self.ultrasonic.read()
        frame_bytes = self.camera.capture_frame_bytes()
        
        # Simulate other values until all sensors are wired
        return {
            "timestamp": datetime.now().isoformat(),
            "greenhouse_id": "GH001-RPI",
            "temperature_internal": temp,
            "humidity": humidity,
            "water_level_cm": water_level,
            "camera_frame_base64": base64.b64encode(frame_bytes).decode('utf-8') if frame_bytes else None,
            # Placeholder data
            "soil_moisture": 68.5,
            "motion_detected": False,
            "soil_ph": 6.4,
        }

# This single instance will be imported by main.py
sensor_aggregator = SensorDataAggregator()