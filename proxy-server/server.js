import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import { formatDate } from "../src/utils/formatDate.js";

dotenv.config();
const app = express();
app.use(cors());

const BALLOONS_URL = "https://a.windbornesystems.com/treasure/";
let balloonHistoryCache = [];
let balloonHistoryLoadedAt = null;
let balloonHistoryLoadingPromise = null;

const radianceCache = new Map();
const RADIANCE_CACHE_TTL_MS = 60 * 60 * 1000;

async function fetchBalloonHistory() {
  const requests = Array.from({ length: 24 }, (_, i) => {
    const filename = i.toString().padStart(2, "0") + ".json";
    return axios.get(BALLOONS_URL + filename).catch(() => null);
  });

  const responses = await Promise.all(requests);
  const history = [];

  responses.forEach((response, i) => {
    if (!response || !Array.isArray(response.data)) return;

    response.data.forEach((coords, index) => {
      const [lat, lon, alt] = coords;
      history.push({
        id: `${i}-${index}`,
        lat,
        lon,
        alt,
        timestamp: Date.now() - i * 3600 * 1000,
      });
    });
  });

  return history;
}

async function loadBalloonHistoryIntoCache() {
  try {
    const history = await fetchBalloonHistory();
    if (history.length) {
      balloonHistoryCache = history;
      balloonHistoryLoadedAt = Date.now();
      console.log("Balloon history cache refreshed, items:", history.length);
    }
  } catch (err) {
    console.error("Failed to refresh balloon history cache:", err);
  }
}

balloonHistoryLoadingPromise = loadBalloonHistoryIntoCache().finally(() => {
  balloonHistoryLoadingPromise = null;
});

setInterval(
  () => {
    loadBalloonHistoryIntoCache();
  },
  60 * 60 * 1000
);

app.get("/api/balloons", async (req, res) => {
  try {
    if (!balloonHistoryCache.length && balloonHistoryLoadingPromise) {
      await balloonHistoryLoadingPromise;
    }

    if (!balloonHistoryCache.length) {
      await loadBalloonHistoryIntoCache();
    }

    res.json(balloonHistoryCache);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.get("/api/radiance", async (req, res) => {
  try {
    const { lat, lon, timestamp } = req.query;

    if (!lat || !lon || !timestamp) {
      console.log("lat: ", lat, "lon: ", lon, "timestamp: ", timestamp);
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const date = formatDate(timestamp);
    const cacheKey = `${lat}:${lon}:${date}`;
    const now = Date.now();

    const cached = radianceCache.get(cacheKey);
    if (cached && now - cached.cachedAt < RADIANCE_CACHE_TTL_MS) {
      return res.json(cached.response);
    }

    const nasaUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=AG&latitude=${lat}&longitude=${lon}&start=${date}&end=${date}&format=JSON`;

    const r = await axios.get(nasaUrl);
    const data = r.data;

    const value = data.properties.parameter.ALLSKY_SFC_SW_DWN[date] ?? null;

    const responsePayload = {
      lat: Number(lat),
      lon: Number(lon),
      date,
      radiance: value,
      raw: data,
    };

    radianceCache.set(cacheKey, {
      response: responsePayload,
      cachedAt: now,
    });

    return res.json(responsePayload);
  } catch (err) {
    console.error("NASA radiance fetch failed:", err);
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.listen(3001, () => console.log("Proxy running on port 3001"));
