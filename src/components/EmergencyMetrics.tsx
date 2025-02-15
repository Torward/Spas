import React, { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { supabase } from "@/lib/supabase";

interface Metrics {
  activeEmergencies: number;
  respondersAvailable: number;
  averageResponseTime: number;
  resourceUtilization: number;
}

const EmergencyMetrics = () => {
  const [metrics, setMetrics] = useState<Metrics>({
    activeEmergencies: 0,
    respondersAvailable: 0,
    averageResponseTime: 0,
    resourceUtilization: 0,
  });

  useEffect(() => {
    loadMetrics();

    const subscription = supabase
      .channel("emergency-metrics")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "emergency_metrics",
        },
        () => {
          loadMetrics();
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadMetrics = async () => {
    const { data } = await supabase.rpc("get_analytics_summary");
    if (data) {
      setMetrics({
        activeEmergencies: data.active_emergencies || 0,
        respondersAvailable: data.available_responders || 0,
        averageResponseTime: data.average_response_time || 0,
        resourceUtilization: data.resource_utilization || 0,
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Active Emergencies
        </h3>
        <p className="text-2xl font-bold">{metrics.activeEmergencies}</p>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Available Responders
        </h3>
        <p className="text-2xl font-bold">{metrics.respondersAvailable}</p>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Avg. Response Time
        </h3>
        <p className="text-2xl font-bold">
          {metrics.averageResponseTime.toFixed(1)} min
        </p>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Resource Utilization
        </h3>
        <Progress value={metrics.resourceUtilization} className="mt-2" />
        <p className="text-sm mt-1">
          {metrics.resourceUtilization.toFixed(1)}%
        </p>
      </Card>
    </div>
  );
};

export default EmergencyMetrics;
