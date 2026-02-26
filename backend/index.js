require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const ML_API_URL = process.env.ML_API_URL || "http://localhost:8000";

/* ==============================
   🔹 CONNECT TO MONGODB ATLAS
============================== */
let dbConnected = false;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Atlas Connected");
    dbConnected = true;
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    console.log("⚠️ Running without database (temporary mode)");
  });

/* ==============================
   🔹 CREATE SCHEMA & MODEL
============================== */
const predictionSchema = new mongoose.Schema({
  features: {
    type: Array,
    required: true,
  },
  prediction: {
    type: Number,
    required: true,
  },
  result: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Prediction = mongoose.model("Prediction", predictionSchema);

/* ==============================
   🔹 HEALTH CHECK ROUTE
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

    // Call ML API
    const response = await axios.post(
      `${ML_API_URL}/predict`,
      { features }
    );

    const { prediction, result } = response.data;

    // Save to DB only if connected
    if (dbConnected) {
      try {
        const newPrediction = new Prediction({
          features,
          prediction,
          result,
        });

        await newPrediction.save();
        console.log("✅ Prediction saved to database");
      } catch (dbError) {
        console.log("⚠️ DB Save Failed:", dbError.message);
      }
    } else {
      console.log("⚠️ Skipping DB save (not connected)");
    }

    res.json(response.data);

  } catch (error) {
    console.error("❌ Prediction Error:", error.message);
    res.status(500).json({ error: "Prediction failed" });
  }
});

/* ==============================
   🔹 GET HISTORY ROUTE
============================== */
app.get("/history", async (req, res) => {
  if (!dbConnected) {
    return res.status(500).json({
      error: "Database not connected"
    });
  }

  try {
    const data = await Prediction.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    console.error("❌ History Fetch Error:", error.message);
    res.status(500).json({ error: "Could not fetch history" });
  }
});

/* ==============================
   🔹 START SERVER
============================== */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});