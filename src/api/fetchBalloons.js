import axios from "axios";

const BASE_URL = "https://a.windbornesystems.com/treasure/";

export const fetchBalloonHistory = async () => {
  const requests = Array.from({ length: 24 }, async (_, i) => {
    const filename = i.toString().padStart(2, "0") + ".json";
    try {
      return await axios.get(BASE_URL + filename);
    } catch {
      return null;
    }
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
};
