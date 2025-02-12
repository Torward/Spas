import React, { useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { MapPin, Navigation, AlertTriangle, User } from "lucide-react";
import EventDetailsDialog from "./EventDetailsDialog";
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
}

interface RealMapViewProps {
  locations?: Location[];
  onMarkerClick?: (location: Location) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const RealMapView: React.FC<RealMapViewProps> = ({
  locations = [],
  onMarkerClick = () => {},
  center = { lat: 55.7558, lng: 37.6173 }, // Moscow by default
  zoom = 12,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([center.lat, center.lng], zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapRef.current);

      // Add custom controls
      const customControl = L.Control.extend({
        options: {
          position: "topright",
        },
        onAdd: function () {
          const container = L.DomUtil.create(
            "div",
            "leaflet-bar leaflet-control",
          );
          container.innerHTML = `
            <button class="p-2 bg-white hover:bg-gray-100 border-b">
              <span class="sr-only">Center Map</span>
              ${Navigation}
            </button>
          `;
          container.onclick = () => {
            mapRef.current?.setView([center.lat, center.lng], zoom);
          };
          return container;
        },
      });

      mapRef.current.addControl(new customControl());
    }

    // Update markers
    locations.forEach((location) => {
      if (!markersRef.current[location.id]) {
        const icon = L.divIcon({
          className: "custom-marker",
          html: `<div class="${location.type === "victim" ? "bg-red-500/20" : "bg-blue-500/20"} p-2 rounded-full">
            ${location.type === "victim" ? AlertTriangle : User}
          </div>`,
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
  }, [locations, center, zoom]);

  return (
    <Card className="w-[900px] h-[600px] relative overflow-hidden">
      <div id="map" className="w-full h-full" />
    </Card>
  );
};

export default RealMapView;
