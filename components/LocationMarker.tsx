"use client";

import { useEffect, useState } from "react";
import { Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Entity } from "@/app";

// Custom bus icon
const bus19Icon = new L.DivIcon({
  className: "bg-blue-600 rounded-full border-2 border-white",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

const bus9Icon = new L.DivIcon({
  className: "bg-green-600 rounded-full border-2 border-white",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

const userIcon = new L.DivIcon({
  className: "bg-red-600 rounded-full border-2 border-white",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8],
});
export default function LocationMarker() {
  const [bus19Positions, setBus19Positions] = useState<
    Array<{ lat: number; lng: number; id: string; label: string }>
  >([]);
  const [bus9Positions, setBus9Positions] = useState<
    Array<{ lat: number; lng: number; id: string; label: string }>
  >([]);

  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const fetchData = async () => {
    try {
      // Use our API proxy route instead of direct external API
      const response = await fetch("/api/bus-data");

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();

      const bus19 = data.entity.filter(
        (entity: Entity) =>
          entity.vehicle &&
          entity.vehicle.trip &&
          entity.vehicle.trip.route_id === "19",
      );

      const bus9 = data.entity.filter(
        (entity: Entity) =>
          entity.vehicle &&
          entity.vehicle.trip &&
          entity.vehicle.trip.route_id === "9",
      );

      // Extract data for bus 19
      const bus19Positions = bus19.map((entity: Entity) => ({
        lat: entity.vehicle.position.latitude,
        lng: entity.vehicle.position.longitude,
        id: entity.vehicle.vehicle?.id || entity.id,
        label: entity.vehicle.vehicle?.label || "Bus 19",
      }));

      // Extract data for bus 9
      const bus9Positions = bus9.map((entity: Entity) => ({
        lat: entity.vehicle.position.latitude,
        lng: entity.vehicle.position.longitude,
        id: entity.vehicle.vehicle?.id || entity.id,
        label: entity.vehicle.vehicle?.label || "Bus 9",
      }));

      setBus19Positions(bus19Positions);
      setBus9Positions(bus9Positions);

      console.log("Updated bus positions:", {
        bus19: bus19Positions,
        bus9: bus9Positions,
      });
    } catch (error) {
      console.error("Error fetching bus data:", error);
    }
  };

  // useeffect that runs every 10 seconds (changed from 1 second to reduce load)
  useEffect(() => {
    fetchData(); // Initial fetch
    const interval = setInterval(() => {
      fetchData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const map = useMapEvents({
    click() {
      map.locate();
    },
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return (
    <>
      {/* Render bus 19 markers */}
      {bus19Positions.map((bus) => (
        <Marker
          key={`bus19-${bus.id}`}
          position={[bus.lat, bus.lng]}
          icon={bus19Icon}
        >
          <Popup>
            <div>
              <h3 className="font-bold">Route 19</h3>
              <p>Bus ID: {bus.id}</p>
              <p>Label: {bus.label}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Render bus 9 markers */}
      {bus9Positions.map((bus) => (
        <Marker
          key={`bus9-${bus.id}`}
          position={[bus.lat, bus.lng]}
          icon={bus9Icon}
        >
          <Popup>
            <div>
              <h3 className="font-bold">Route 9</h3>
              <p>Bus ID: {bus.id}</p>
              <p>Label: {bus.label}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* User location marker */}
      {position && (
        <Marker position={position} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}
    </>
  );
}
