import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());
console.log("API Key:", process.env.OPENAQ_API_KEY);

app.get("/api/air-quality", async (req, res) => {
  try {
    const { coordinates, radius = 10000, limit = 100 } = req.query;
    const response = await axios.get("https://api.openaq.org/v3/locations", {
      headers: { "X-API-Key": process.env.OPENAQ_API_KEY },
      params: { coordinates, radius, limit },
    });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.listen(3001, () => console.log("Proxy running on port 3001"));
