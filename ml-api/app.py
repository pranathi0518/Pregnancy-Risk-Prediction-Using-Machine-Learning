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

        df = pd.DataFrame([data.features], columns=feature_names)

        predicted_class = model.predict(df)[0]
        predicted_class = str(predicted_class)

        return {
            "prediction": predicted_class,
            "result": predicted_class
        }

    except Exception as e:
        print("Prediction error:", str(e))
        raise HTTPException(status_code=400, detail=str(e))