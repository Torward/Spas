import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface IncidentReport {
  id: string;
  emergency_id: string;
  type: string;
  severity: "low" | "medium" | "high";
  status: "active" | "resolved";
  description: string;
  victim_count?: number;
  hazmat_present: boolean;
  resources_required: string[];
  created_at: string;
  updated_at: string;
  response_time_minutes?: number;
  resolution_time_minutes?: number;
  weather_conditions?: {
    temperature: number;
    conditions: string;
    visibility: number;
    wind_speed: number;
  };
  location_details?: {
    address: string;
    coordinates: [number, number];
    access_points?: string[];
    hazards?: string[];
  };
}

interface IncidentReportFormProps {
  emergencyId: string;
  onSubmit?: (report: Partial<IncidentReport>) => void;
}

const IncidentReportForm = ({
  emergencyId,
  onSubmit,
}: IncidentReportFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Partial<IncidentReport>>({
    emergency_id: emergencyId,
    type: "",
    severity: "medium",
    status: "active",
    description: "",
    hazmat_present: false,
    resources_required: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("incident_reports")
        .insert({
          ...report,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Incident report created successfully",
      });

      if (onSubmit && data) {
        onSubmit(data);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create incident report",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Incident Type</Label>
          <Select
            value={report.type}
            onValueChange={(value) => setReport({ ...report, type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fire">Fire</SelectItem>
              <SelectItem value="medical">Medical Emergency</SelectItem>
              <SelectItem value="hazmat">Hazardous Materials</SelectItem>
              <SelectItem value="rescue">Rescue Operation</SelectItem>
              <SelectItem value="natural">Natural Disaster</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Severity</Label>
          <Select
            value={report.severity}
            onValueChange={(value: "low" | "medium" | "high") =>
              setReport({ ...report, severity: value })
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
          <Label>Victim Count</Label>
          <Input
            type="number"
            value={report.victim_count || ""}
            onChange={(e) =>
              setReport({ ...report, victim_count: parseInt(e.target.value) })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>HAZMAT Present</Label>
          <Select
            value={report.hazmat_present ? "yes" : "no"}
            onValueChange={(value) =>
              setReport({ ...report, hazmat_present: value === "yes" })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="HAZMAT present?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={report.description}
          onChange={(e) =>
            setReport({ ...report, description: e.target.value })
          }
          rows={4}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Report"}
      </Button>
    </form>
  );
};

export default IncidentReportForm;
