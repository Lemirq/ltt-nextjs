"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { Entity } from "@/app";
import BusSelector from "./BusSelector";
import BusEtaPanel from "./BusEtaPanel";

// Route color mapping (extend as needed)
const routeColors: Record<string, string> = {
  // ... existing color mapping
};

// User icon
const userIcon = new L.DivIcon({
  className: "bg-red-600 rounded-full border-2 border-white",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8],
});

// Get bus icon with the specified color
const getBusIcon = (routeId: string) => {
  const color = routeColors[routeId] || "gray";
  return new L.DivIcon({
    html: `<div class="bg-${color}-600 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold" style="width:24px;height:24px;">${routeId}</div>`,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

interface BusPosition {
  lat: number;
  lng: number;
  id: string;
  label: string;
  routeId: string;
  speed: number; // m/s
  heading: number; // bearing/direction
  timestamp: number; // Last update time
}

interface BusEta {
  routeId: string;
  busId: string;
  label: string;
  eta: number; // in minutes
  distance: number; // in meters
}

export default function LocationMarker() {
  const [busPositions, setBusPositions] = useState<BusPosition[]>([]);
  const [availableRoutes, setAvailableRoutes] = useState<string[]>([]);
  // Always include route 19 by default
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>(["19"]);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [etaData, setEtaData] = useState<BusEta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showEta, setShowEta] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);

  // Filter buses based on selected routes
  const filteredBusPositions = useMemo(() => {
    return busPositions.filter((bus) => selectedRoutes.includes(bus.routeId));
  }, [busPositions, selectedRoutes]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/bus-data");

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();

      // Extract all buses with their route IDs
      const allBuses = data.entity
        .filter(
          (entity: Entity) =>
            entity.vehicle &&
            entity.vehicle.trip &&
            entity.vehicle.trip.route_id,
        )
        .map((entity: Entity) => {
          const routeId = entity.vehicle.trip.route_id;
          return {
            lat: entity.vehicle.position.latitude,
            lng: entity.vehicle.position.longitude,
            id: entity.vehicle.vehicle?.id || entity.id,
            label: entity.vehicle.vehicle?.label || `Bus ${routeId}`,
            routeId,
            speed: entity.vehicle.position.speed || 0, // Speed in m/s
            heading: entity.vehicle.position.bearing || 0, // Direction
            timestamp: entity.vehicle.timestamp || Date.now() / 1000,
          };
        });

      // Get unique route IDs and sort them numerically
      const routes = Array.from(
        new Set(allBuses.map((bus) => bus.routeId)),
      ).sort((a, b) => {
        // Try to convert to numbers and sort
        const numA = parseInt(a);
        const numB = parseInt(b);
        return numA - numB;
      });

      setBusPositions(allBuses);
      setAvailableRoutes(routes);

      // Calculate ETA if user position is set
      if (position) {
        calculateETA(allBuses, position);
      }

      // Ensure route 19 is always selected
      if (!selectedRoutes.includes("19")) {
        setSelectedRoutes((prev) => [...prev, "19"]);
      }
    } catch (error) {
      console.error("Error fetching bus data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate ETA for each bus to the user's position
  const calculateETA = (
    buses: BusPosition[],
    userPos: { lat: number; lng: number },
  ) => {
    console.log("Calculating ETA for user at", userPos);
    const userLatLng = L.latLng(userPos.lat, userPos.lng);

    const etaResults = buses.map((bus) => {
      const busLatLng = L.latLng(bus.lat, bus.lng);
      const distance = userLatLng.distanceTo(busLatLng); // in meters

      // Calculate ETA in minutes
      // If speed is 0 or very low, use a default speed of 5 m/s (18 km/h)
      const speed = bus.speed > 1 ? bus.speed : 5;
      const etaMinutes = distance / speed / 60;

      return {
        routeId: bus.routeId,
        busId: bus.id,
        label: bus.label,
        eta: etaMinutes,
        distance,
      };
    });

    // Sort by ETA
    etaResults.sort((a, b) => a.eta - b.eta);

    // Filter by selected routes
    const filteredEta = etaResults
      .filter((eta) => selectedRoutes.includes(eta.routeId))
      .slice(0, 10); // Show up to 10 buses

    console.log("ETA data calculated:", filteredEta);
    setEtaData(filteredEta);
    setShowEta(true); // Make sure ETA panel is shown
  };

  // Toggle bus route selection
  const handleRouteToggle = useCallback((routeId: string) => {
    setSelectedRoutes((prevSelected) => {
      // Do not allow deselecting route 19
      if (routeId === "19" && prevSelected.includes("19")) {
        return prevSelected;
      }

      if (prevSelected.includes(routeId)) {
        return prevSelected.filter((id) => id !== routeId);
      } else {
        return [...prevSelected, routeId].sort((a, b) => {
          // Sort numerically
          const numA = parseInt(a);
          const numB = parseInt(b);
          return numA - numB;
        });
      }
    });
  }, []);

  // Update data every 10 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 10000);
    return () => clearInterval(interval);
  }, []); // No dependencies to avoid re-creating interval

  // Update ETA whenever position, routes, or bus positions change
  useEffect(() => {
    if (position && busPositions.length > 0) {
      calculateETA(busPositions, position);
    }
  }, [position, selectedRoutes, busPositions]);

  // Handle map events for user location - use browser geolocation API
  const mapEvents = useMapEvents({
    click(e) {
      // Check if the click is on an interactive element
      const target = e.originalEvent.target as HTMLElement;

      if (
        target.closest(".bus-selector") ||
        target.closest(".eta-panel") ||
        target.closest(".leaflet-popup") ||
        target.closest(".leaflet-control")
      ) {
        return; // Don't handle clicks on UI elements
      }

      // Show loading state
      setLocatingUser(true);

      // Request user's actual location via browser geolocation API
      mapEvents.locate({
        setView: false, // We'll handle this manually
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      });
    },
    locationfound(e) {
      console.log("User location found:", e.latlng);
      setPosition(e.latlng);
      mapEvents.flyTo(e.latlng, mapEvents.getZoom());

      // Calculate ETA with the user's actual position
      if (busPositions.length > 0) {
        calculateETA(busPositions, e.latlng);
      }

      setLocatingUser(false); // End loading state
    },
    locationerror(e) {
      console.error("Error locating user:", e);
      setLocatingUser(false);
      alert(
        "Could not find your location. Please make sure location services are enabled.",
      );
    },
  });

  return (
    <>
      {/* Render bus markers */}
      {filteredBusPositions.map((bus) => (
        <Marker
          key={`bus-${bus.routeId}-${bus.id}`}
          position={[bus.lat, bus.lng]}
          icon={getBusIcon(bus.routeId)}
        >
          <Popup>
            <div className="space-y-1">
              <h3 className="font-bold text-lg">Route {bus.routeId}</h3>
              <p>
                <span className="font-medium">Bus ID:</span> {bus.id}
              </p>
              <p>
                <span className="font-medium">Label:</span> {bus.label}
              </p>
              <p>
                <span className="font-medium">Speed:</span>{" "}
                {bus.speed
                  ? `${(bus.speed * 3.6).toFixed(1)} km/h`
                  : "Not available"}
              </p>
              <p>
                <span className="font-medium">Direction:</span>{" "}
                {bus.heading ? `${bus.heading}°` : "N/A"}
              </p>
              {position && (
                <p className="font-medium">
                  Distance:{" "}
                  {(() => {
                    const distance = L.latLng(
                      position.lat,
                      position.lng,
                    ).distanceTo(L.latLng(bus.lat, bus.lng));
                    return distance < 1000
                      ? `${Math.round(distance)} m`
                      : `${(distance / 1000).toFixed(2)} km`;
                  })()}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Last updated:{" "}
                {new Date(bus.timestamp * 1000).toLocaleTimeString()}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* User location marker */}
      {position && (
        <Marker position={position} icon={userIcon}>
          <Popup>
            <div>
              <p className="font-bold">Your Location</p>
              <p>
                {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Loading indicator */}
      {(isLoading || locatingUser) && (
        <div className="absolute top-20 left-4 z-[999] bg-white/80 dark:bg-gray-800/80 p-2 rounded-md shadow-md">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 rounded-full border-t-transparent"></div>
            <span className="text-sm">
              {locatingUser
                ? "Finding your location..."
                : "Loading bus data..."}
            </span>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 pb-24 h-full w-full">
        {/* Bus selector UI */}
        <BusSelector
          availableRoutes={availableRoutes}
          selectedRoutes={selectedRoutes}
          onRouteToggle={handleRouteToggle}
          lockedRoutes={["19"]} // Lock route 19 so it can't be deselected
        />

        {/* ETA panel */}
        <BusEtaPanel
          etaData={etaData}
          isVisible={showEta && !!position && etaData.length > 0}
        />
      </div>
    </>
  );
}
