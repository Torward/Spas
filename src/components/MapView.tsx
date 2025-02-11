import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { MapPin, Navigation, AlertTriangle, User } from "lucide-react";

interface Location {
  id: string;
  type: "victim" | "rescuer";
  position: { lat: number; lng: number };
  status: "active" | "enroute" | "critical" | "resolved";
  name: string;
}

interface MapViewProps {
  locations?: Location[];
  onMarkerClick?: (location: Location) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const defaultLocations: Location[] = [
  {
    id: "1",
    type: "victim",
    position: { lat: 40.7128, lng: -74.006 },
    status: "critical",
    name: "Emergency Site A",
  },
  {
    id: "2",
    type: "rescuer",
    position: { lat: 40.7138, lng: -74.007 },
    status: "enroute",
    name: "Rescue Team 1",
  },
  {
    id: "3",
    type: "victim",
    position: { lat: 40.7118, lng: -74.005 },
    status: "active",
    name: "Emergency Site B",
  },
];

const MapView: React.FC<MapViewProps> = ({
  locations = defaultLocations,
  onMarkerClick = () => {},
  center = { lat: 40.7128, lng: -74.006 },
  zoom = 12,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );

  const handleMarkerClick = (location: Location) => {
    setSelectedLocation(location);
    onMarkerClick(location);
  };

  const getMarkerColor = (status: Location["status"]) => {
    switch (status) {
      case "critical":
        return "text-red-500";
      case "active":
        return "text-yellow-500";
      case "enroute":
        return "text-blue-500";
      case "resolved":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card className="w-[900px] h-[600px] bg-slate-900 p-4 relative overflow-hidden">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" size="icon">
                <Navigation className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Center Map</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Mock Map Background */}
      <div className="w-full h-full bg-slate-800 rounded-lg relative">
        {/* Grid lines to simulate map */}
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="border border-slate-700/30" />
          ))}
        </div>

        {/* Map Markers */}
        {locations.map((location) => (
          <TooltipProvider key={location.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleMarkerClick(location)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-full hover:scale-110 transition-transform
                    ${location.type === "victim" ? "bg-red-500/20" : "bg-blue-500/20"}`}
                  style={{
                    left: `${((location.position.lng + 74.01) * 1000) % 100}%`,
                    top: `${((location.position.lat - 40.71) * 1000) % 100}%`,
                  }}
                >
                  {location.type === "victim" ? (
                    <AlertTriangle
                      className={`h-6 w-6 ${getMarkerColor(location.status)}`}
                    />
                  ) : (
                    <User
                      className={`h-6 w-6 ${getMarkerColor(location.status)}`}
                    />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{location.name}</p>
                <p className="text-xs capitalize">{location.status}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {/* Selected Location Info */}
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 right-4 bg-slate-800/90 p-4 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <h3 className="font-semibold">{selectedLocation.name}</h3>
          </div>
          <div className="mt-2 text-sm text-slate-300">
            <p>
              Status:{" "}
              <span className="capitalize">{selectedLocation.status}</span>
            </p>
            <p>
              Location: {selectedLocation.position.lat.toFixed(4)},{" "}
              {selectedLocation.position.lng.toFixed(4)}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MapView;
