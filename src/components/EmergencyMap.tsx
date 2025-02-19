import React, { useEffect, useState } from "react";
import { Card } from "./ui/card";
import RealMapView from "./RealMapView";
import { supabase } from "@/lib/supabase";
import { AlertTriangle } from "lucide-react";

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

const EmergencyMap = () => {
  const [customMarkers, setCustomMarkers] = useState<
    Array<{ position: { lat: number; lng: number }; label?: string }>
  >([]);
  const [selectedPosition, setSelectedPosition] = useState<
    { lat: number; lng: number } | undefined
  >();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [hazardZones, setHazardZones] = useState<HazardZone[]>([]);
  const [showWeatherOverlay, setShowWeatherOverlay] = useState(false);

  useEffect(() => {
    // Load weather data
    loadWeatherData();
    // Load hazard zones
    loadHazardZones();

    // Subscribe to hazard updates
    const hazardSubscription = supabase
      .channel("hazard-zones")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "hazard_reports",
        },
        () => {
          loadHazardZones();
        },
      )
      .subscribe();
    // Subscribe to emergency locations
    const emergencySubscription = supabase
      .channel("emergency-locations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "emergencies",
        },
        (payload) => {
          const emergency = payload.new;
          updateLocations(emergency);
        },
      )
      .subscribe();

    // Subscribe to responder locations
    const responderSubscription = supabase
      .channel("responder-locations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "responder_locations",
        },
        (payload) => {
          const responder = payload.new;
          updateLocations(responder);
        },
      )
      .subscribe();

    // Initial load
    loadLocations();

    return () => {
      emergencySubscription.unsubscribe();
      responderSubscription.unsubscribe();
      hazardSubscription.unsubscribe();
    };
  }, []);

  const loadWeatherData = async () => {
    try {
      // In a real app, this would call a weather API
      const mockWeatherData: WeatherData = {
        temperature: 18,
        conditions: "Partly Cloudy",
        windSpeed: 12,
        visibility: 10000,
      };
      setWeatherData(mockWeatherData);
    } catch (error) {
      console.error("Error loading weather data:", error);
    }
  };

  const loadHazardZones = async () => {
    const { data: hazards } = await supabase
      .from("hazard_reports")
      .select("*")
      .eq("status", "active");

    if (hazards) {
      setHazardZones(
        hazards.map((hazard) => ({
          id: hazard.id,
          type: hazard.type,
          severity: hazard.severity,
          position: { lat: hazard.latitude, lng: hazard.longitude },
          radius: hazard.radius || 500, // Default radius in meters
        })),
      );
    }
  };

  const loadLocations = async () => {
    // Load emergencies
    const { data: emergencies } = await supabase
      .from("emergencies")
      .select("*, emergency_details:emergency_details(*)")
      .not("status", "eq", "resolved");

    // Load responders
    const { data: responders } = await supabase
      .from("responder_locations")
      .select("*, responder:responder_id(*)");

    const locations: Location[] = [
      ...(emergencies?.map((emergency) => ({
        id: emergency.id,
        type: "victim",
        position: { lat: emergency.latitude, lng: emergency.longitude },
        status: emergency.status,
        name: `Emergency #${emergency.id}`,
        priority: emergency.emergency_details?.priority || "medium",
        details: {
          type: emergency.emergency_details?.type,
          description: emergency.emergency_details?.description,
          victimCount: emergency.emergency_details?.victim_count,
          hazmatPresent: emergency.emergency_details?.hazmat_present,
        },
      })) || []),
      ...(responders?.map((responder) => ({
        id: responder.id,
        type: "rescuer",
        position: { lat: responder.latitude, lng: responder.longitude },
        status: responder.responder?.status || "active",
        name: responder.responder?.name || `Responder #${responder.id}`,
      })) || []),
    ];

    setLocations(locations);
  };

  const updateLocations = (data: any) => {
    setLocations((prev) => {
      const index = prev.findIndex((loc) => loc.id === data.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          position: { lat: data.latitude, lng: data.longitude },
          status: data.status,
        };
        return updated;
      }
      return prev;
    });
  };

  const handleMarkerClick = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleAddMarker = (
    location: { lat: number; lng: number },
    label?: string,
  ) => {
    setCustomMarkers([...customMarkers, { position: location, label }]);
  };

  const handleSearchAddress = async (address: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
      );
      const data = await response.json();

      if (data && data[0]) {
        const { lat, lon } = data[0];
        handleAddMarker(
          { lat: parseFloat(lat), lng: parseFloat(lon) },
          address,
        );
      }
    } catch (error) {
      console.error("Error searching address:", error);
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <MapMarkerControl
          onAddMarker={handleAddMarker}
          onSearchAddress={handleSearchAddress}
        />
        <HazardZoneControl
          selectedPosition={selectedPosition}
          onHazardZoneCreated={() => {
            setSelectedPosition(undefined);
            loadHazardZones();
          }}
        />
      </div>
      <RealMapView
        locations={locations}
        hazardZones={hazardZones}
        weatherData={showWeatherOverlay ? weatherData : null}
        onMarkerClick={handleMarkerClick}
        onMapClick={(latlng) => setSelectedPosition(latlng)}
        center={{ lat: 55.7558, lng: 37.6173 }} // Moscow center by default
        zoom={11}
        customMarkers={customMarkers}
      />
      <div className="absolute top-4 right-4 z-10 space-y-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowWeatherOverlay(!showWeatherOverlay)}
        >
          {showWeatherOverlay ? "Hide Weather" : "Show Weather"}
        </Button>
      </div>

      {weatherData && showWeatherOverlay && (
        <div className="absolute top-4 left-4 z-10 bg-background/90 p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">Weather Conditions</h3>
          <div className="space-y-1 text-sm">
            <p>{weatherData.temperature}°C</p>
            <p>{weatherData.conditions}</p>
            <p>Wind: {weatherData.windSpeed} km/h</p>
            <p>Visibility: {(weatherData.visibility / 1000).toFixed(1)} km</p>
          </div>
        </div>
      )}

      {selectedLocation && (
        <div className="absolute bottom-4 left-4 right-4 bg-background/90 p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-semibold">{selectedLocation.name}</h3>
          </div>
          {selectedLocation.priority && (
            <Badge
              variant={
                selectedLocation.priority === "high"
                  ? "destructive"
                  : selectedLocation.priority === "medium"
                    ? "default"
                    : "secondary"
              }
            >
              {selectedLocation.priority} Priority
            </Badge>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            Status: {selectedLocation.status}
          </p>
          <p className="text-sm text-muted-foreground">
            Location: {selectedLocation.position.lat.toFixed(6)},{" "}
            {selectedLocation.position.lng.toFixed(6)}
          </p>
          {selectedLocation.details && (
            <div className="mt-2 space-y-1 text-sm">
              {selectedLocation.details.type && (
                <p>Type: {selectedLocation.details.type}</p>
              )}
              {selectedLocation.details.description && (
                <p>Description: {selectedLocation.details.description}</p>
              )}
              {selectedLocation.details.victimCount && (
                <p>Victims: {selectedLocation.details.victimCount}</p>
              )}
              {selectedLocation.details.hazmatPresent && (
                <Badge variant="destructive">HAZMAT Present</Badge>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default EmergencyMap;
