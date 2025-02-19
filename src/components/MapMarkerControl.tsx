import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { MapPin, Search, Crosshair } from "lucide-react";

interface MapMarkerControlProps {
  onAddMarker: (location: { lat: number; lng: number }, label?: string) => void;
  onSearchAddress: (address: string) => Promise<void>;
}

const MapMarkerControl = ({
  onAddMarker,
  onSearchAddress,
}: MapMarkerControlProps) => {
  const [coordinates, setCoordinates] = useState({ lat: "", lng: "" });
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");

  const handleCoordinateSubmit = () => {
    const lat = parseFloat(coordinates.lat);
    const lng = parseFloat(coordinates.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      onAddMarker({ lat, lng }, label);
      setCoordinates({ lat: "", lng: "" });
      setLabel("");
    }
  };

  const handleAddressSubmit = async () => {
    if (address.trim()) {
      await onSearchAddress(address);
      setAddress("");
      setLabel("");
    }
  };

  return (
    <div className="absolute top-4 left-4 z-10 space-y-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary" size="sm" className="w-full">
            <MapPin className="h-4 w-4 mr-2" />
            Add Marker
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Marker</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>By Coordinates</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Latitude"
                  value={coordinates.lat}
                  onChange={(e) =>
                    setCoordinates({ ...coordinates, lat: e.target.value })
                  }
                />
                <Input
                  placeholder="Longitude"
                  value={coordinates.lng}
                  onChange={(e) =>
                    setCoordinates({ ...coordinates, lng: e.target.value })
                  }
                />
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCoordinateSubmit}
              >
                <Crosshair className="h-4 w-4 mr-2" />
                Add by Coordinates
              </Button>
            </div>

            <div className="space-y-2">
              <Label>By Address</Label>
              <Input
                placeholder="Enter address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAddressSubmit}
              >
                <Search className="h-4 w-4 mr-2" />
                Search Address
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Marker Label (Optional)</Label>
              <Input
                placeholder="Enter label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MapMarkerControl;
