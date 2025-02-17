import React, { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { supabase } from "@/lib/supabase";
import {
  AlertTriangle,
  Clock,
  Users,
  MessageSquare,
  CheckCircle,
  Activity,
} from "lucide-react";

interface TimelineEvent {
  id: string;
  emergency_id: string;
  event_type:
    | "status_change"
    | "team_assigned"
    | "resource_allocated"
    | "communication"
    | "victim_update"
    | "hazard_reported";
  description: string;
  timestamp: string;
  metadata?: any;
  severity?: "low" | "medium" | "high";
  actor?: string;
}

interface EmergencyTimelineProps {
  emergencyId: string;
}

const EmergencyTimeline = ({ emergencyId }: EmergencyTimelineProps) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    loadEvents();

    const subscription = supabase
      .channel(`emergency-${emergencyId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "emergency_timeline",
          filter: `emergency_id=eq.${emergencyId}`,
        },
        (payload) => {
          setEvents((prev) => [payload.new as TimelineEvent, ...prev]);
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [emergencyId]);

  const loadEvents = async () => {
    const { data } = await supabase
      .from("emergency_timeline")
      .select("*")
      .eq("emergency_id", emergencyId)
      .order("timestamp", { ascending: false });

    if (data) {
      setEvents(data);
    }
  };

  const getEventIcon = (type: TimelineEvent["event_type"]) => {
    switch (type) {
      case "status_change":
        return <Activity className="h-4 w-4" />;
      case "team_assigned":
        return <Users className="h-4 w-4" />;
      case "communication":
        return <MessageSquare className="h-4 w-4" />;
      case "victim_update":
        return <AlertTriangle className="h-4 w-4" />;
      case "hazard_reported":
        return <AlertTriangle className="h-4 w-4" />;
      case "resource_allocated":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Emergency Timeline</h3>
      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex gap-3 relative">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    event.severity === "high"
                      ? "bg-red-100 text-red-600"
                      : event.severity === "medium"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {getEventIcon(event.event_type)}
                </div>
                <div className="flex-1 w-0.5 bg-border mt-2" />
              </div>

              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium capitalize">
                    {event.event_type.replace("_", " ")}
                  </span>
                  {event.severity && (
                    <Badge
                      variant={
                        event.severity === "high"
                          ? "destructive"
                          : event.severity === "medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {event.severity}
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-sm">{event.description}</p>
                {event.actor && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    By: {event.actor}
                  </p>
                )}
                {event.metadata && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="font-medium capitalize">
                          {key.replace("_", " ")}:
                        </span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default EmergencyTimeline;
