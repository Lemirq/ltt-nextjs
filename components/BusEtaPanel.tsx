"use client";

import { useState, useEffect } from "react";

interface BusEta {
  routeId: string;
  busId: string;
  label: string;
  eta: number; // in minutes
  distance: number; // in meters
}

interface BusEtaPanelProps {
  etaData: BusEta[];
  isVisible: boolean;
}

// Route color mapping (should match LocationMarker.tsx)
const routeColors: Record<string, string> = {
  "1": "blue",
  "2": "green",
  "3": "purple",
  "4": "yellow",
  "5": "orange",
  "6": "pink",
  "7": "indigo",
  "8": "gray",
  "9": "blue",
  "10": "green",
  "12": "purple",
  "13": "yellow",
  "14": "orange",
  "15": "pink",
  "16": "indigo",
  "17": "gray",
  "19": "blue",
  "20": "green",
  "21": "purple",
  "22": "yellow",
  "23": "orange",
  "24": "pink",
  "25": "indigo",
  "26": "gray",
  "27": "blue",
  "28": "green",
  "29": "purple",
  "30": "yellow",
  "31": "orange",
  "33": "pink",
  "34": "indigo",
  "35": "gray",
  "36": "blue",
  "38": "green",
  "40": "purple",
  "90": "yellow",
  "91": "orange",
  "92": "pink",
  "93": "indigo",
  "94": "gray",
  "102": "blue",
};

export default function BusEtaPanel({ etaData, isVisible }: BusEtaPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  // Add monitoring for visibility changes
  useEffect(() => {
    if (isVisible && etaData?.length > 0) {
      console.log("ETA Panel should be visible with data:", etaData);
    } else {
      console.log("ETA Panel is hidden or has no data", {
        isVisible,
        dataLength: etaData?.length,
      });
    }
  }, [isVisible, etaData]);

  if (!isVisible || !etaData || etaData.length === 0) {
    return null;
  }

  // Format the ETA time to be more readable
  const formatEta = (minutes: number) => {
    if (minutes < 1) return "Less than a minute";
    if (minutes < 60) return `${Math.round(minutes)} minutes`;

    const hours = Math.floor(minutes / 60);
    const remainingMins = Math.round(minutes % 60);
    return `${hours} hr ${remainingMins} min`;
  };

  // Format distance to be more readable
  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)} meters`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  // Position the panel based on device type
  const panelPosition = isMobile
    ? "bottom-20 left-4 right-4 max-w-none"
    : "bottom-4 left-4 max-w-[350px]";

  return (
    <div
      className={`relative mt-5 z-[990] bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg overflow-hidden eta-panel`}
      onClick={(e) => e.stopPropagation()} // Prevent map clicks from propagating through UI
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">Estimated Arrival Times</h2>
        <button
          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? "Expand" : "Collapse"}
        </button>
      </div>

      {!isCollapsed && (
        <>
          <div className="space-y-3 max-h-[40vh] overflow-y-auto">
            {etaData.map((bus) => {
              const color = routeColors[bus.routeId] || "gray";

              return (
                <div
                  key={`${bus.routeId}-${bus.busId}`}
                  className="p-3 rounded-md border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center mb-1">
                    <span
                      className={`inline-block w-4 h-4 mr-2 rounded-full bg-${color}-600`}
                    ></span>
                    <div className="font-medium">Route {bus.routeId}</div>
                    <div className="text-xs ml-auto text-gray-600 dark:text-gray-400">
                      {bus.label}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      {formatDistance(bus.distance)} away
                    </div>
                    <div className="text-sm font-bold">
                      {formatEta(bus.eta)}
                    </div>
                  </div>

                  {/* Progress bar for ETA visualization */}
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`bg-${color}-600 h-1.5 rounded-full`}
                      style={{
                        width: `${Math.min(100, 100 - bus.eta * 5)}%`,
                        minWidth: "5%",
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            * ETAs are estimates based on current bus positions and speeds
          </div>
        </>
      )}
    </div>
  );
}
