import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());

app.get("/api/air-quality", async (req, res) => {
  const { coordinates, radius = 1000, limit = 10 } = req.query;

  try {
    // Fetching locations
    const locationRes = await axios.get("https://api.openaq.org/v3/locations", {
      headers: { "X-API-Key": process.env.OPENAQ_API_KEY },
      params: { coordinates, radius, limit },
    });
    const locations = locationRes.data.results;

    console.log("first location:", locations?.[0]);

    const sensorToLocation = new Map();
    const sensorIDs = [];

    // Mapping locations to sensor id

    for (let location of locations) {
      const sensor = location.sensors?.[0];
      if (sensor && sensor.id) {
        sensorToLocation.set(sensor.id, location);
        sensorIDs.push(sensor.id);
      }
    }

    if (!sensorIDs.length) return res.status(404).json({ message: "No sensors found nearby" });

    // Fetching measurements per sensor

    const measurementPromises = sensorIDs.map(async (id) => {
      try {
        const response = await axios.get(
          `https://api.openaq.org/v3/sensors/${id}/measurements/hourly`,
          {
            headers: { "X-API-Key": process.env.OPENAQ_API_KEY },
            params: { limit: 1 },
          }
        );
        const measurement = response.data.results?.[0]?.value || null;
        return { sensorId: id, measurement };
      } catch {
        return { sensorId: id, measurement: null };
      }
    });

    const measurementResults = await Promise.allSettled(measurementPromises);

    // Merging location and measurement

    const enrichedData = measurementResults
      .map((measurementResponse) => {
        if (measurementResponse.status !== "fulfilled") {
          // console.log("response null status ", measurementResponse);
          return null;
        }

        const { sensorId, measurement } = measurementResponse.value;
        if (!measurement) {
          return null;
        }

        const location = sensorToLocation.get(sensorId);
        if (!location) {
          return null;
        }

        return {
          coordinates: location.coordinates,
          value: measurement,
        };
      })
      .filter(Boolean);

    console.log("enrichedData: ", enrichedData);

    res.json({ count: enrichedData.length, data: enrichedData });
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.get("/api/balloons", async (req, res) => {
  try { 
    
  } catch (error) { 

  }


app.listen(3001, () => console.log("Proxy running on port 3001"));
