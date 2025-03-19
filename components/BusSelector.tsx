"use client";

import { useState, useEffect } from "react";

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

interface BusSelectorProps {
  availableRoutes: string[];
  selectedRoutes: string[];
  onRouteToggle: (routeId: string) => void;
  lockedRoutes?: string[]; // Routes that cannot be deselected
}

export default function BusSelector({
  availableRoutes,
  selectedRoutes,
  onRouteToggle,
  lockedRoutes = [],
}: BusSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  // Filter routes based on search term
  const filteredRoutes =
    searchTerm.length > 0
      ? availableRoutes.filter((route) => route.includes(searchTerm))
      : availableRoutes;

  // Toggle all routes
  const toggleAll = () => {
    if (selectedRoutes.length === availableRoutes.length) {
      // If all are selected, deselect all except locked routes
      availableRoutes.forEach((route) => {
        if (selectedRoutes.includes(route) && !lockedRoutes.includes(route)) {
          onRouteToggle(route);
        }
      });
    } else {
      // Otherwise select all
      availableRoutes.forEach((route) => {
        if (!selectedRoutes.includes(route)) {
          onRouteToggle(route);
        }
      });
    }
  };

  // Position the selector based on device type
  const selectorPosition = isMobile
    ? "bottom-4 right-4 left-4 max-w-none"
    : "top-4 right-4 max-w-[250px]";

  return (
    <div
      className={`relative  z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden bus-selector`}
      onClick={(e) => e.stopPropagation()} // Prevent map clicks from propagating through UI
    >
      <div
        className="p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Bus Routes</h2>
          <span className="text-sm bg-blue-600 text-white px-2 py-0.5 rounded-full">
            {selectedRoutes.length} Selected
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 max-h-[50vh] overflow-y-auto">
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search routes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
            />
          </div>

          <div className="mb-3 flex justify-between items-center">
            <button
              onClick={toggleAll}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
            >
              {selectedRoutes.length === availableRoutes.length
                ? "Deselect All"
                : "Select All"}
            </button>

            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredRoutes.length} routes
            </span>
          </div>

          <div
            className={`grid ${isMobile ? "grid-cols-3" : "grid-cols-2"} gap-2`}
          >
            {filteredRoutes.map((routeId) => {
              const color = routeColors[routeId] || "gray";
              const isLocked = lockedRoutes.includes(routeId);

              return (
                <div key={routeId} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`route-${routeId}`}
                    checked={selectedRoutes.includes(routeId)}
                    onChange={() => onRouteToggle(routeId)}
                    disabled={isLocked}
                    className="mr-2"
                  />
                  <label
                    htmlFor={`route-${routeId}`}
                    className={`flex items-center ${isLocked ? "opacity-70" : "cursor-pointer"}`}
                  >
                    <span
                      className={`inline-block w-3 h-3 mr-2 rounded-full bg-${color}-600`}
                    ></span>
                    {routeId}
                    {isLocked && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
