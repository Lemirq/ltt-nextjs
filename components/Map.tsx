"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import LocationMarker from "./LocationMarker";
import "leaflet/dist/leaflet.css";

export default function Map() {
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden relative">
      {/* <div
        className={`absolute top-4 left-4 z-[1000] bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg shadow-lg ${isMobile ? "max-w-[calc(100%-32px)]" : "max-w-[300px]"}`}
        onClick={(e) => e.stopPropagation()} // Prevent map clicks from propagating
      >
        <h1 className="text-xl font-bold mb-1">LTC Bus Tracker</h1>
        <p className={`${isMobile ? "text-xs" : "text-sm"}`}>
          <b>Click on the map</b> to find your current location and see bus
          arrival times
        </p>
      </div> */}

      <MapContainer
        zoom={isMobile ? 14 : 15} // Adjust zoom level for mobile
        center={{ lat: 43.015638766275465, lng: -81.3394222 }}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl={!isMobile} // Hide default zoom controls on mobile
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker />
      </MapContainer>

      {/* Additional instruction overlay */}
      {/* <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-[999] bg-blue-600 text-white py-2 px-4 rounded-full shadow-lg text-sm text-center pointer-events-none opacity-80">
        Click anywhere on the map to locate yourself
      </div> */}
    </div>
  );
}
