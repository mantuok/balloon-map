import { useEffect, useState } from "react";
import { fetchBalloons } from "../../api/fetchBalloons";
import { fetchWeather } from "../../api/fetchWeather";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";

const CENTER = [37.3382, -121.8863];

const BalloonMap = () => {
  const [balloons, setBalloons] = useState([]);

  // delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });

  useEffect(() => {
    const load = async () => {
      const allBalloons = await fetchBalloons();
      setBalloons(allBalloons);
    };
    load();
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
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </section>
  );
};

export default BalloonMap;
