import cv2
import base64
import numpy as np
from pathlib import Path
from threading import Thread, Lock
import time

class VideoSimulator:
    """Simulate camera feed using a video file"""
    
    def __init__(self, video_path="demo_videos/polyhouse_plants.mp4"):
        self.video_path = video_path
        self.cap = None
        self.current_frame = None
        self.frame_lock = Lock()
        self.is_running = False
        self.thread = None
        
        # Try to load video
        if Path(video_path).exists():
            self.cap = cv2.VideoCapture(video_path)
            print(f"✅ Video simulator loaded: {video_path}")
        else:
            print(f"⚠️ Video file not found: {video_path}")
            print("   Using static image generation instead")
    
    def start(self):
        """Start video playback thread"""
        if self.cap and not self.is_running:
            self.is_running = True
            self.thread = Thread(target=self._playback_loop, daemon=True)
            self.thread.start()
            print("▶️ Video simulator started")
    
    def stop(self):
        """Stop video playback"""
        self.is_running = False
        if self.thread:
            self.thread.join()
        if self.cap:
            self.cap.release()
        print("⏹️ Video simulator stopped")
    
    def _playback_loop(self):
        """Continuous video playback loop"""
        while self.is_running:
            ret, frame = self.cap.read()
            
            # Loop video when it ends
            if not ret:
                self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                ret, frame = self.cap.read()
            
            if ret:
                # Resize to standard resolution
                frame = cv2.resize(frame, (640, 480))
                
                with self.frame_lock:
                    self.current_frame = frame
            
            # Control playback speed (30 FPS)
            time.sleep(1/30)
    
    def get_frame(self):
        """Get current frame as bytes"""
        with self.frame_lock:
            if self.current_frame is not None:
                # Encode frame as JPEG
                _, buffer = cv2.imencode('.jpg', self.current_frame)
                return buffer.tobytes()
        
        # Fallback: generate static green image
        return self._generate_static_frame()
    
    def get_frame_base64(self):
        """Get current frame as base64 string"""
        frame_bytes = self.get_frame()
        return base64.b64encode(frame_bytes).decode('utf-8')
    
    def add_overlay_text(self, text, position=(10, 30), color=(0, 255, 0)):
        """Add text overlay to current frame (for disease detection demo)"""
        with self.frame_lock:
            if self.current_frame is not None:
                cv2.putText(
                    self.current_frame, 
                    text, 
                    position,
                    cv2.FONT_HERSHEY_SIMPLEX, 
                    0.7, 
                    color, 
                    2
                )
    
    def highlight_disease_region(self, bbox, label="Disease Detected"):
        """Draw bounding box around detected disease"""
        with self.frame_lock:
            if self.current_frame is not None:
                x, y, w, h = bbox
                # Draw red rectangle
                cv2.rectangle(self.current_frame, (x, y), (x+w, y+h), (0, 0, 255), 2)
                # Add label
                cv2.putText(
                    self.current_frame,
                    label,
                    (x, y-10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 0, 255),
                    2
                )
    
    def _generate_static_frame(self):
        """Generate a static plant image if no video available"""
        # Create green gradient background
        img = np.zeros((480, 640, 3), dtype=np.uint8)
        img[:, :] = [45, 100, 30]  # Dark green
        
        # Add "leaf" shapes
        cv2.ellipse(img, (200, 200), (80, 120), 45, 0, 360, (60, 140, 50), -1)
        cv2.ellipse(img, (400, 250), (100, 140), -30, 0, 360, (50, 130, 40), -1)
        cv2.ellipse(img, (320, 350), (90, 110), 0, 0, 360, (55, 135, 45), -1)
        
        # Add text
        cv2.putText(img, "SIMULATED CAMERA FEED", (150, 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        cv2.putText(img, "No video file - Using static image", (120, 450),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
        
        _, buffer = cv2.imencode('.jpg', img)
        return buffer.tobytes()

# Global instance
video_simulator = VideoSimulator()