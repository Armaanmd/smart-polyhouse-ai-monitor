# backend/app/ai_models.py - REVISED FOR CLASSIFICATION MODEL
import numpy as np
import tensorflow as tf
from PIL import Image
import io

class HibiscusClassifier:
    def __init__(self, model_path='backend/app/hibiscus_disease_classifier.h5'):
        self.model = None
        # IMPORTANT: The order of this list MUST match the order printed by Colab
        self.class_names = ['diseased', 'fresh'] 
        try:
            # Load the Keras model
            self.model = tf.keras.models.load_model(model_path)
            print("✅ Successfully loaded custom-trained classification model.")
        except Exception as e:
            print(f"❌ ERROR: Could not load classification model: {e}")

    def classify_image(self, image_bytes: bytes):
        if not self.model:
            return "Error", 0.0

        try:
            # Prepare the image for the model
            img = Image.open(io.BytesIO(image_bytes)).resize((180, 180))
            img_array = tf.keras.utils.img_to_array(img)
            img_array = tf.expand_dims(img_array, 0) # Create a batch of 1

            # Make a prediction
            predictions = self.model.predict(img_array, verbose=0)
            score = tf.nn.softmax(predictions[0])

            # Get the top prediction and its confidence
            predicted_class = self.class_names[np.argmax(score)]
            confidence = 100 * np.max(score)

            return predicted_class, round(confidence, 2)
        except Exception as e:
            print(f"Error during model inference: {e}")
            return "Error", 0.0

# Create one instance for the entire application
hibiscus_classifier = HibiscusClassifier()

class DiseaseDetector:
    def detect_disease(self, frame_bytes: bytes):
        predicted_class, confidence = hibiscus_classifier.classify_image(frame_bytes)

        diseases = []
        if predicted_class == 'diseased':
            diseases.append({
                'name': 'Leaf Disease',
                'confidence': confidence,
                'recommended_action': 'Inspect plant for specific pests or fungal spots.'
            })

        return { 'diseases_detected': diseases, 'overall_health': predicted_class }

# Pest and Growth monitors can remain as placeholders for now
class PestIdentifier:
    def identify_pest(self, frame_bytes: bytes):
        return { 'pests_detected': [], 'infestation_level': 'none' }

class GrowthMonitor:
    def measure_growth(self, frame_bytes: bytes):
        return { 'canopy_coverage_percent': 0, 'growth_stage': 'unknown' }