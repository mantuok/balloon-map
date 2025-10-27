import { useEffect, useState } from "react";
import { fetchBalloons } from "../../api/fetchBalloons";
import { fetchWeather } from "../../api/fetchWeather";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { fetchAirPollution } from "../../api/fetchAirPollution";

const CENTER = [37.3382, -121.8863];

const BalloonMap = () => {
  const [balloons, setBalloons] = useState([]);
  const [heatMapData, setHeatMapData] = useState([]);

  // delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });

  useEffect(() => {
    const loadBalloons = async () => {
      const allBalloons = await fetchBalloons();
      setBalloons(allBalloons);
    };
    loadBalloons();
  }, []);

  useEffect(() => {
    const loadPollution = async () => {
      const rawPollutionData = await fetchAirPollution("35.1353", "-106.584702");
      console.log(rawPollutionData.data);
      // const pollutionPoints = rawPollutionData.results.flatMap((station) =>
      //   station.sensors.map((sensor) => [
      //     station.coordinates.latitude,
      //     station.coordinates.longitude,
      //     sensor.value ?? 0,
      //   ])
      // );
      // setHeatMapData(pollutionPoints);
    };
    loadPollution();
  }, []);

  return (
    <section className="balloon_map__section">
      <h2>Balloon Map</h2>
      <MapContainer
        center={CENTER}
        zoom={5}
        scrollWheelZoom={false}
        style={{ height: "400px", width: "75%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MarkerClusterGroup>
          {balloons.map((balloon) => (
            <Marker key={balloon.id} position={[balloon.lat, balloon.lon]}>
              <Popup>
                <strong>ID:</strong> {balloon.id} <br />
                <strong>Alt:</strong> {balloon.alt.toFixed(2)} km
                <strong>:</strong> {balloon.alt.toFixed(2)}
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </section>
  );
};

export default BalloonMap;
