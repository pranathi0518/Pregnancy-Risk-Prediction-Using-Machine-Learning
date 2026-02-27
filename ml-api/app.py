from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os

# ---------------------------------------------
# Initialize FastAPI
# ---------------------------------------------
app = FastAPI(title="Pregnancy Risk ML API")

# ---------------------------------------------
# Enable CORS
# ---------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------
# Load Trained Model
# ---------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "model.pkl"))

print("Model classes:", model.classes_)  # Debug

# ---------------------------------------------
# Request Schema
# ---------------------------------------------
class InputData(BaseModel):
    features: list[float]

# ---------------------------------------------
# Health Check Route
# ---------------------------------------------
@app.get("/")
def home():
    return {"status": "ML API running successfully"}

# ---------------------------------------------
# Prediction Route
# ---------------------------------------------
@app.post("/predict")
def predict(data: InputData):
    try:
        # Convert input to numpy array
        features = np.array(data.features).reshape(1, -1)

        # Predict class
        predicted_class = model.predict(features)[0]

        # Convert multi-class output to Risk Level
        if predicted_class == "Normal":
            result_label = "Low Risk"
        else:
            result_label = "High Risk"

        return {
            "prediction": predicted_class,
            "result": result_label
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))