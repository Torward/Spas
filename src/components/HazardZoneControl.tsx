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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { AlertTriangle } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/lib/supabase";

interface HazardZoneControlProps {
  onHazardZoneCreated: () => void;
  selectedPosition?: { lat: number; lng: number };
}

const HazardZoneControl = ({
  onHazardZoneCreated,
  selectedPosition,
}: HazardZoneControlProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [hazardData, setHazardData] = useState({
    type: "",
    severity: "medium" as "low" | "medium" | "high",
    radius: "500",
    description: "",
  });

  const handleSubmit = async () => {
    if (!selectedPosition) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a location on the map first",
      });
      return;
    }

    try {
      const { error } = await supabase.from("hazard_reports").insert({
        type: hazardData.type,
        severity: hazardData.severity,
        radius: parseInt(hazardData.radius),
        description: hazardData.description,
        latitude: selectedPosition.lat,
        longitude: selectedPosition.lng,
        status: "active",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Hazard zone created successfully",
      });

      setHazardData({
        type: "",
        severity: "medium",
        radius: "500",
        description: "",
      });
      setIsOpen(false);
      onHazardZoneCreated();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create hazard zone",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="w-full">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Add Hazard Zone
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Hazard Zone</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Hazard Type</Label>
            <Select
              value={hazardData.type}
              onValueChange={(value) =>
                setHazardData({ ...hazardData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chemical">Chemical Hazard</SelectItem>
                <SelectItem value="fire">Fire Hazard</SelectItem>
                <SelectItem value="structural">Structural Hazard</SelectItem>
                <SelectItem value="biological">Biological Hazard</SelectItem>
                <SelectItem value="radiation">Radiation Hazard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Severity</Label>
            <Select
              value={hazardData.severity}
              onValueChange={(value: "low" | "medium" | "high") =>
                setHazardData({ ...hazardData, severity: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Radius (meters)</Label>
            <Input
              type="number"
              value={hazardData.radius}
              onChange={(e) =>
                setHazardData({ ...hazardData, radius: e.target.value })
              }
              min="100"
              max="5000"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={hazardData.description}
              onChange={(e) =>
                setHazardData({ ...hazardData, description: e.target.value })
              }
              placeholder="Describe the hazard..."
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={!selectedPosition || !hazardData.type}
          >
            Create Hazard Zone
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HazardZoneControl;
