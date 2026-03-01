require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");

const app = express();

/* ==============================
   🔹 CORS FIX (OPEN FOR NOW)
============================== */
app.use(cors());   // ✅ Allow all origins to avoid CORS blocking

app.use(express.json());

const PORT = process.env.PORT || 4000;
const ML_API_URL = process.env.ML_API_URL;

/* ==============================
   🔹 CONNECT TO MONGODB ATLAS
============================== */
let dbConnected = false;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Atlas Connected");
    dbConnected = true;
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err.message);
  });

/* ==============================
   🔹 SCHEMA & MODEL
============================== */
const predictionSchema = new mongoose.Schema({
  features: { type: Array, required: true },
  prediction: { type: String, required: true },  // ✅ String (important)
  result: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Prediction = mongoose.model("Prediction", predictionSchema);

/* ==============================
   🔹 HEALTH CHECK
============================== */
app.get("/", (req, res) => {
  res.json({
    message: "Backend running successfully",
    database: dbConnected ? "Connected" : "Not Connected"
  });
});

/* ==============================
   🔹 PREDICTION ROUTE
============================== */
app.post("/predict", async (req, res) => {
  try {
    const { features } = req.body;

    if (!features) {
      return res.status(400).json({ error: "Features are required" });
    }

    console.log("Calling ML API...");

    // 🔹 Call ML API
    const response = await axios.post(
      `${ML_API_URL}/predict`,
      { features }
    );

    console.log("ML API Response:", response.data);

    const { prediction, result } = response.data;

    // 🔹 Save to DB if connected
    if (dbConnected) {
      try {
        await Prediction.create({
          features,
          prediction,
          result,
        });
        console.log("Prediction saved to DB");
      } catch (dbErr) {
        console.log("DB Save Error:", dbErr.message);
      }
    }

    return res.json({ prediction, result });

  } catch (error) {
    console.error("Prediction Error:", error.message);

    if (error.response) {
      console.error("ML API Error:", error.response.data);
    }

    return res.status(500).json({ error: "Prediction failed" });
  }
});

/* ==============================
   🔹 START SERVER
============================== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});