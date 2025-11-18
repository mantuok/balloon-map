import axios from "axios";

export const fetchRadiance = async (lat, lon, timestamp) => {
  try {
    const response = await axios.get("http://localhost:3001/api/radiance", {
      params: { lat, lon, timestamp },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch radiance:", error);
    return null;
  }
};
