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
# Enable CORS (for frontend/backend access)
# ---------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------
# Load Model and Threshold
# ---------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "model.pkl"))
threshold = joblib.load(os.path.join(BASE_DIR, "threshold.pkl"))

# Make sure threshold is float
threshold = float(threshold)

# ---------------------------------------------
# Request Body Schema
# ---------------------------------------------
class InputData(BaseModel):
    features: list[float]

# ---------------------------------------------
# Health Check Route
# ---------------------------------------------
@app.get("/")
def home():
    return {"status": "ML API running"}

# ---------------------------------------------
# Prediction Route
# ---------------------------------------------
@app.post("/predict")
def predict(data: InputData):
    try:
        # Convert input to numpy array
        features = np.array(data.features).reshape(1, -1)

        # Get probability
        probability = model.predict_proba(features)[0][1]

        return {
            "prediction": float(probability),
            "result": "High Risk" if probability >= threshold else "Low Risk"
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
