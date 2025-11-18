import { useEffect, useState } from "react";
import { fetchBalloons } from "../../api/fetchBalloons";
import { fetchRadiance } from "../../api/fetchRadiance";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from "react-leaflet";
// import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";

const CENTER = [37.3382, -121.8863];

const BalloonMap = () => {
  const [balloons, setBalloons] = useState([]);

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
    if (balloons.length > 0 && balloons[0]) {
      const loadRadiance = async () => {
        const data = await fetchRadiance(balloons[0].lat, balloons[0].lon, balloons[0].timestamp);
        console.log("balloon: ", balloons[0]);
        console.log("radiance: ", data);
      };
      loadRadiance();
    }
  }, [balloons]);

  const MapEvents = () => {
    const map = useMapEvent("moveend", () => {
      const mapBounds = map.getBounds();
      const visibleBalloons = balloons.filter((balloon) =>
        mapBounds.contains([balloon.lat, balloon.lon])
      );
      console.log("visible balloons: ", visibleBalloons);
    });
    return null;
  };

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
        {/* <MarkerClusterGroup>
          {balloons.map((balloon) => (
            <Marker key={balloon.id} position={[balloon.lat, balloon.lon]}>
              <Popup>
                <strong>ID:</strong> {balloon.id} <br />
                <strong>Alt:</strong> {balloon.alt.toFixed(2)} km
                <strong>:</strong> {balloon.alt.toFixed(2)}
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup> */}
        <MapEvents />
      </MapContainer>
    </section>
  );
};

export default BalloonMap;
