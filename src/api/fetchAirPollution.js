import axios from "axios";

export const fetchAirPollution = async (lat, lon) => {
  try {
    const response = await axios.get("http://localhost:3001/api/air-quality", {
      params: { coordinates: `${lat},${lon}`, radius: 12000, limit: 1000 },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch air pollution:", error);
    return null;
  }
};
