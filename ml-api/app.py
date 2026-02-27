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
# Load Model and Threshold
# ---------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "model.pkl"))
threshold = float(joblib.load(os.path.join(BASE_DIR, "threshold.pkl")))

print("Model classes:", model.classes_)  # Debug print

# ---------------------------------------------
# Request Schema
# ---------------------------------------------
class InputData(BaseModel):
    features: list[float]

# ---------------------------------------------
# Health Check
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
        features = np.array(data.features).reshape(1, -1)

        # Get probabilities for both classes
        probabilities = model.predict_proba(features)[0]

        # Identify index of High Risk class
        # Assuming label 1 = High Risk (common case)
        if 1 in model.classes_:
            high_risk_index = list(model.classes_).index(1)
        else:
            # fallback: assume class 0 is High Risk
            high_risk_index = 0

        high_risk_probability = probabilities[high_risk_index]

        result_label = "High Risk" if high_risk_probability >= threshold else "Low Risk"

        return {
            "prediction": float(high_risk_probability),
            "result": result_label
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))