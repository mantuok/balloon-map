import axios from "axios";

export const fetchBalloons = async () => {
  try {
    const response = await axios.get("http://localhost:3001/api/balloons");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch balloons:", error);
    return null;
  }
};
