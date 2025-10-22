import axios from "axios";

const BASE_URL = "/treasure/";

export const fetchBalloons = async () => {
  const requests = Array.from({ length: 24 }, (_, i) => {
    const filename = i.toString().padStart(2, "0") + ".json";
    return axios.get(BASE_URL + filename).catch(() => null);
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
