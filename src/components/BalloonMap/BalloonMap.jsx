import { useEffect, useState, useRef, useMemo } from "react";
import { fetchBalloons } from "../../api/fetchBalloons";
import { fetchRadiance } from "../../api/fetchRadiance";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import { makeKey } from "../../utils/makeKey";
import { getBalloonColor } from "../../utils/getBalloonColor";
import { debounce } from "../../utils/debounce";

const CENTER = [37.3382, -121.8863];

const BalloonMap = () => {
  const [balloons, setBalloons] = useState([]);
  const [visibleBalloons, setVisibleBalloons] = useState([]);
  const [radianceMap, setRadianceMap] = useState({});
  const [isBalloonsLoading, setIsBalloonsLoading] = useState(true);
  const [isRadianceLoading, setIsRadianceLoading] = useState(false);
  const isMapLoading = isBalloonsLoading || isRadianceLoading;
  const mapRef = useRef(null);
  const radianceKeysRef = useRef(new Set());

  const memoizedMarkers = useMemo(() => {
    console.log("🔵 Rebuilding markers...");

    return visibleBalloons.map((balloon) => {
      const radiance = radianceMap[balloon.id] ?? null;
      const color = getBalloonColor(radiance);

      return (
        <Marker
          key={balloon.id}
          position={[balloon.lat, balloon.lon]}
          icon={L.divIcon({
            className: "custom-balloon-marker",
            html: `
            <div style="
              background-color: ${color};
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 2px solid #333;">
            </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })}
        >
          <Popup>
            <strong>ID:</strong> {balloon.id} <br />
          </Popup>
        </Marker>
      );
    });
  }, [visibleBalloons, radianceMap]);

  useEffect(() => {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  // Loading balloons data
  useEffect(() => {
    const loadBalloons = async () => {
      try {
        const allBalloons = await fetchBalloons();
        const safeBalloons = allBalloons || [];
        setBalloons(safeBalloons);
        setVisibleBalloons(safeBalloons);
        console.log(safeBalloons);
      } finally {
        setIsBalloonsLoading(false);
      }
    };
    loadBalloons();
  }, []);

  // // Setting initial visible balloons
  // useEffect(() => {
  //   if (!mapRef.current || balloons.length === 0) return;
  //   const mapBounds = mapRef.current.getBounds();
  //   const initialCurrentBalloons = balloons.filter((balloon) =>
  //     mapBounds.contains([balloon.lat, balloon.lon])
  //   );
  //   setVisibleBalloons(initialCurrentBalloons);
  // }, [balloons]);

  // Loading radiance data for visible balloons
  useEffect(() => {
    if (!visibleBalloons.length) return;

    const loadRadiance = async () => {
      // Filter balloons that don't have radiance data loaded yet
      const balloonsToFetchFor = visibleBalloons.filter((balloon) => {
        const key = makeKey(balloon);
        return !radianceKeysRef.current.has(key);
      });

      if (!balloonsToFetchFor.length) {
        console.log("No balloons to fetch radiance for");
        return;
      }

      // Fetching radiance for filtered balloons
      setIsRadianceLoading(true);
      const results = await Promise.all(
        balloonsToFetchFor.map(async (balloon) => {
          const data = await fetchRadiance(balloon.lat, balloon.lon, balloon.timestamp);
          if (!data) return null;

          // Updating radiance keys set
          const key = makeKey(balloon);
          radianceKeysRef.current.add(key);
          return { ...data, balloonId: balloon.id };
        })
      );
      setIsRadianceLoading(false);
      // Updating radiance data state
      const filtered = results.filter(Boolean);
      if (filtered.length) {
        setRadianceMap((prev) => {
          const next = { ...prev };
          filtered.forEach((item) => {
            next[item.balloonId] = item.radiance;
          });
          return next;
        });
      }

      console.log("radiance data: ", filtered);
    };

    loadRadiance();
  }, [visibleBalloons]);

  const MapEvents = () => {
    const map = useMapEvent("moveend", () => {
      debouncedUpdate();
    });

    const debouncedUpdate = useMemo(
      () =>
        debounce(() => {
          if (!map) return;
          const mapBounds = map.getBounds();
          const visible = (balloons || []).filter((b) => mapBounds.contains([b.lat, b.lon]));
          setVisibleBalloons(visible);
          console.log("Updated visible balloons:", visible.length);
        }, 300),
      [map]
    );

    return null;
  };

  return (
    <section className="balloon_map__section">
      <h2>Balloon Map</h2>
      {isMapLoading && (
        <div className="balloon-map-skeleton">
          <div className="balloon-map-skeleton__header" />
          <div className="balloon-map-skeleton__body" />
        </div>
      )}
      <MapContainer
        center={CENTER}
        zoom={7}
        scrollWheelZoom={false}
        style={{ height: "400px", width: "75%" }}
        whenCreated={(map) => {
          mapRef.current = map;
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MarkerClusterGroup>{memoizedMarkers}</MarkerClusterGroup>
        <MapEvents />
      </MapContainer>
    </section>
  );
};

export default BalloonMap;
