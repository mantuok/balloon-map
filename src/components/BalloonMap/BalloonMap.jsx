import { useEffect, useState } from "react";
import { fetchBalloons } from "../../api/fetchBalloons";
import { fetchWeather } from "../../api/fetchWeather";

const BalloonMap = () => {
  const [balloons, setBalloons] = useState([]);

  useEffect(() => {
    const load = async () => {
      const allBalloons = await fetchBalloons();
      setBalloons(allBalloons);
    };
    load();
  }, []);

  return <section className="balloon_map__section">Balloon Map</section>;
};

export default BalloonMap;
