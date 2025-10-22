import { useEffect, useState } from "react";
import { fetchBalloons } from "../../api/fetchBalloons";
import { fetchWeather } from "../../api/fetchWeather";

const BalloonMap = () => {
  const [enrichedBallonHistory, setEnrichedBalloonHistory] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const balloons = await fetchBalloons();
      // const enriched = await Promise.all(
      //   balloons.map(async (balloon) => {
      //     const weather = await fetchWeather(balloon.lat, balloon.lon);
      //     return { ...balloon, ...weather };
      //   })
      // );
      // setEnrichedBalloonHistory(enriched.filter(Boolean));
      setEnrichedBalloonHistory(balloons);
    };
    loadData();
  }, []);

  // console.log(enrichedBallonHistory);

  return <section className="balloon_map__section">Balloon Map</section>;
};

export default BalloonMap;
