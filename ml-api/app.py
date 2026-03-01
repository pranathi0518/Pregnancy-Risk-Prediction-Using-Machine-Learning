from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
import os

# ===============================
# Initialize FastAPI
# ===============================
app = FastAPI(title="Pregnancy Risk ML API")

# ===============================
# Enable CORS
# ===============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================
# Load Model
# ===============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model = joblib.load(os.path.join(BASE_DIR, "model.pkl"))

print("Model loaded successfully")

# ===============================
# Request Schema
# ===============================
class InputData(BaseModel):
    features: list[float]

# ===============================
# Health Check
# ===============================
@app.get("/")
def home():
    return {"status": "ML API running successfully"}

# ===============================
# Prediction Route
# ===============================
@app.post("/predict")
def predict(data: InputData):
    try:
        feature_names = [
            "Age",
            "BMI",
            "BMI_Category",
            "DiastolicBP",
            "BP_Risk",
            "BodyTemp",
            "HeartRate",
            "Hematocrit",
            "Anemia_Risk",
            "SerumCreatinine",
            "WBC",
            "USG_AC",
            "USG_BPD",
            "USG_FL",
            "Fetal_Growth_Stress",
            "GestationalAge_Weeks",
            "Trimester",
            "OGTT_Fasting",
            "OGTT_1hr",
            "OGTT_2hr",
            "Metabolic_Risk"
        ]

        # Convert list into DataFrame with correct column order
        df = pd.DataFrame([data.features], columns=feature_names)

        # Get numeric prediction (0 or 1)
        prediction = int(model.predict(df)[0])

        # Convert numeric output to label
        if prediction == 0:
            result = "Low Risk"
        else:
            result = "High Risk"

        return {
            "prediction": prediction,
            "result": result
        }

    except Exception as e:
        print("Prediction error:", str(e))
        raise HTTPException(status_code=400, detail=str(e))