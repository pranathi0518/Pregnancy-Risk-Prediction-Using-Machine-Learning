import { useState } from "react";
import "./App.css";

function App() {
  const [f, setF] = useState({});
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setF({
      ...f,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value
    });
  };

  const predictRisk = async () => {
    const features = [
      Number(f.Age),
      Number(f.BMI),
      Number(f.BMI_Category),
      Number(f.DiastolicBP),
      f.BP_Risk || 0,
      Number(f.BodyTemp),
      Number(f.HeartRate),
      Number(f.Hematocrit),
      f.Anemia_Risk || 0,
      Number(f.SerumCreatinine),
      Number(f.WBC),
      Number(f.USG_AC),
      Number(f.USG_BPD),
      Number(f.USG_FL),
      f.Fetal_Growth_Stress || 0,
      Number(f.GestationalAge_Weeks),
      Number(f.Trimester),
      Number(f.OGTT_Fasting),
      Number(f.OGTT_1hr),
      Number(f.OGTT_2hr),
      f.Metabolic_Risk || 0
    ];

    try {
      const res = await fetch("http://localhost:4000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ features })
      });

      const data = await res.json();
      setResult(data);

    } catch (err) {
      alert("Failed to connect to backend");
    }
  };

  return (
    <div className="container">
      <h1>Pregnancy Growth Risk Prediction</h1>
      <p className="subtitle">
        Enter patient details to predict pregnancy growth risk
      </p>

      {/* BASIC INFO */}
      <section>
        <h2>Basic Information</h2>
        <div className="grid">
          <div className="field">
            <label>Age</label>
            <input name="Age" onChange={handleChange} />
          </div>

          <div className="field">
            <label>Gestational Age (weeks)</label>
            <input name="GestationalAge_Weeks" onChange={handleChange} />
          </div>

          <div className="field">
            <label>Trimester</label>
            <select name="Trimester" onChange={handleChange}>
              <option value="">Select</option>
              <option value="1">1st Trimester</option>
              <option value="2">2nd Trimester</option>
              <option value="3">3rd Trimester</option>
            </select>
          </div>
        </div>
      </section>

      {/* BODY & METABOLIC */}
      <section>
        <h2>Body & Metabolic Health</h2>
        <div className="grid">
          <div className="field">
            <label>BMI</label>
            <input name="BMI" onChange={handleChange} />
          </div>

          <div className="field">
            <label>BMI Category</label>
            <select name="BMI_Category" onChange={handleChange}>
              <option value="">Select</option>
              <option value="0">Underweight</option>
              <option value="1">Normal</option>
              <option value="2">Overweight</option>
              <option value="3">Obese</option>
            </select>
          </div>

          <div className="checkbox-field">
            <input
              type="checkbox"
              name="Metabolic_Risk"
              onChange={handleChange}
            />
            <label>Metabolic Risk</label>
          </div>
        </div>
      </section>

      {/* VITALS */}
      <section>
        <h2>Vitals & Blood Pressure</h2>
        <div className="grid">
          <div className="field">
            <label>Diastolic BP</label>
            <input name="DiastolicBP" onChange={handleChange} />
          </div>

          <div className="field">
            <label>Body Temperature</label>
            <input name="BodyTemp" onChange={handleChange} />
          </div>

          <div className="field">
            <label>Heart Rate</label>
            <input name="HeartRate" onChange={handleChange} />
          </div>

          <div className="checkbox-field">
            <input type="checkbox" name="BP_Risk" onChange={handleChange} />
            <label>BP Risk</label>
          </div>
        </div>
      </section>

      {/* LAB */}
      <section>
        <h2>Blood & Laboratory Parameters</h2>
        <div className="grid">
          <div className="field">
            <label>Hematocrit</label>
            <input name="Hematocrit" onChange={handleChange} />
          </div>

          <div className="field">
            <label>Serum Creatinine</label>
            <input name="SerumCreatinine" onChange={handleChange} />
          </div>

          <div className="field">
            <label>White Blood Cells</label>
            <input name="WBC" onChange={handleChange} />
          </div>

          <div className="checkbox-field">
            <input
              type="checkbox"
              name="Anemia_Risk"
              onChange={handleChange}
            />
            <label>Anemia Risk</label>
          </div>
        </div>
      </section>

      {/* ULTRASOUND */}
      <section>
        <h2>Ultrasound Measurements</h2>
        <div className="grid">
          <div className="field">
            <label>USG AC</label>
            <input name="USG_AC" onChange={handleChange} />
          </div>

          <div className="field">
            <label>USG BPD</label>
            <input name="USG_BPD" onChange={handleChange} />
          </div>

          <div className="field">
            <label>USG FL</label>
            <input name="USG_FL" onChange={handleChange} />
          </div>

          <div className="checkbox-field">
            <input
              type="checkbox"
              name="Fetal_Growth_Stress"
              onChange={handleChange}
            />
            <label>Fetal Growth Stress</label>
          </div>
        </div>
      </section>

      {/* OGTT */}
      <section>
        <h2>OGTT Test</h2>
        <div className="grid">
          <div className="field">
            <label>OGTT Fasting</label>
            <input name="OGTT_Fasting" onChange={handleChange} />
          </div>

          <div className="field">
            <label>OGTT 1hr</label>
            <input name="OGTT_1hr" onChange={handleChange} />
          </div>

          <div className="field">
            <label>OGTT 2hr</label>
            <input name="OGTT_2hr" onChange={handleChange} />
          </div>
        </div>
      </section>

      <button onClick={predictRisk}>Predict Risk</button>

      {result && (
        <div className="result">
          <h3>Prediction Result</h3>
          <p>
            Risk Level:{" "}
            <span className={result.result === "High Risk" ? "high" : "low"}>
              {result.result}
            </span>
          </p>
          <p className="disclaimer">
            This prediction is for educational purposes only.
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
