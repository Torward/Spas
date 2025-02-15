import React, { useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { AlertTriangle, User } from "lucide-react";
import L from "leaflet";

// Leaflet icon fix
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

interface Location {
  id: string;
  type: "victim" | "rescuer";
  position: { lat: number; lng: number };
  status: "active" | "enroute" | "critical" | "resolved";
  name: string;
  priority?: "high" | "medium" | "low";
  details?: {
    type?: string;
    description?: string;
    victimCount?: number;
    hazmatPresent?: boolean;
  };
}

interface WeatherData {
  temperature: number;
  conditions: string;
  windSpeed: number;
  visibility: number;
}

interface HazardZone {
  id: string;
  type: string;
  severity: "high" | "medium" | "low";
  position: { lat: number; lng: number };
  radius: number;
}

interface RealMapViewProps {
  locations?: Location[];
  hazardZones?: HazardZone[];
  weatherData?: WeatherData | null;
  onMarkerClick?: (location: Location) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const RealMapView: React.FC<RealMapViewProps> = ({
  locations = [],
  hazardZones = [],
  weatherData = null,
  onMarkerClick = () => {},
  center = { lat: 55.7558, lng: 37.6173 }, // Moscow by default
  zoom = 12,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const hazardLayersRef = useRef<{ [key: string]: L.Circle }>({});
  const weatherControlRef = useRef<L.Control | null>(null);

  const getMarkerColor = (location: Location) => {
    if (location.type === "victim") {
      return location.priority === "high"
        ? "#ef4444"
        : location.priority === "medium"
          ? "#f97316"
          : "#eab308";
    }
    return "#3b82f6";
  };

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([center.lat, center.lng], zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }

    // Clear previous weather control
    if (weatherControlRef.current) {
      weatherControlRef.current.remove();
      weatherControlRef.current = null;
    }

    // Add weather overlay if available
    if (weatherData) {
      const weatherControl = L.control({ position: "bottomleft" });
      weatherControl.onAdd = () => {
        const div = L.DomUtil.create("div", "weather-overlay");
        div.innerHTML = `
          <div class="bg-background/90 p-2 rounded-lg text-sm">
            ${weatherData.temperature}°C | ${weatherData.conditions}<br>
            Wind: ${weatherData.windSpeed} km/h<br>
            Visibility: ${(weatherData.visibility / 1000).toFixed(1)} km
          </div>
        `;
        return div;
      };
      weatherControl.addTo(mapRef.current);
      weatherControlRef.current = weatherControl;
    }

    // Update hazard zones
    Object.values(hazardLayersRef.current).forEach((layer) => layer.remove());
    hazardLayersRef.current = {};

    hazardZones.forEach((hazard) => {
      const circle = L.circle([hazard.position.lat, hazard.position.lng], {
        radius: hazard.radius,
        color:
          hazard.severity === "high"
            ? "#ef4444"
            : hazard.severity === "medium"
              ? "#f97316"
              : "#eab308",
        fillColor:
          hazard.severity === "high"
            ? "#ef4444"
            : hazard.severity === "medium"
              ? "#f97316"
              : "#eab308",
        fillOpacity: 0.2,
      }).addTo(mapRef.current!);

      circle.bindPopup(`
        <div class="p-2">
          <h3 class="font-semibold">${hazard.type}</h3>
          <p class="text-sm">${hazard.severity.toUpperCase()} Severity</p>
        </div>
      `);

      hazardLayersRef.current[hazard.id] = circle;
    });

    // Update markers
    locations.forEach((location) => {
      if (!markersRef.current[location.id]) {
        const color = getMarkerColor(location);
        const icon = L.divIcon({
          className: "custom-marker",
          html: `
            <div class="p-2 rounded-full" style="background-color: ${color}20">
              <div style="color: ${color}">
                ${
                  location.type === "victim"
                    ? "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z'/><line x1='12' y1='9' x2='12' y2='13'/><line x1='12' y1='17' x2='12.01' y2='17'/></svg>"
                    : "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/></svg>"
                }
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, -20],
        });

        const marker = L.marker(
          [location.position.lat, location.position.lng],
          { icon },
        )
          .addTo(mapRef.current!)
          .on("click", () => onMarkerClick(location));

        markersRef.current[location.id] = marker;
      } else {
        markersRef.current[location.id].setLatLng([
          location.position.lat,
          location.position.lng,
        ]);
      }
    });

    // Remove old markers
    Object.keys(markersRef.current).forEach((id) => {
      if (!locations.find((loc) => loc.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [locations, hazardZones, weatherData, center, zoom, onMarkerClick]);

  return (
    <Card className="w-[900px] h-[600px] relative overflow-hidden">
      <div id="map" className="w-full h-full" />
    </Card>
  );
};

export default RealMapView;
