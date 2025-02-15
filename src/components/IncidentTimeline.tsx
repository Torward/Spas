import React, { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { supabase } from "@/lib/supabase";

interface TimelineEvent {
  id: string;
  emergency_id: string;
  event_type: string;
  description: string;
  timestamp: string;
  severity?: "low" | "medium" | "high";
  actor?: string;
  metadata?: any;
}

const IncidentTimeline = ({ emergencyId }: { emergencyId: string }) => {
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

  const getEventIcon = (type: string) => {
    switch (type) {
      case "resource_assigned":
        return "🚒";
      case "status_change":
        return "🔄";
      case "hazard_reported":
        return "⚠️";
      case "victim_update":
        return "👤";
      default:
        return "📝";
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Incident Timeline</h3>
      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex gap-3 relative">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  {getEventIcon(event.event_type)}
                </div>
                <div className="flex-1 w-0.5 bg-border mt-2" />
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{event.event_type}</span>
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
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default IncidentTimeline;
