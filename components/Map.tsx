"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import LocationMarker from "./LocationMarker";
import "leaflet/dist/leaflet.css";

export default function Map() {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <MapContainer
        zoom={20}
        center={{ lat: 43.015638766275465, lng: -81.3394222 }}
        style={{ height: "100%", backgroundColor: "black", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker />
      </MapContainer>
    </div>
  );
}
