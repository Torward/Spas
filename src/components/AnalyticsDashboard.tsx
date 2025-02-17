import React, { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { supabase } from "@/lib/supabase";

interface AnalyticsData {
  incidentAnalytics: {
    total_incidents: number;
    avg_response_time: number;
    avg_resolution_time: number;
    severity_distribution: {
      high: number;
      medium: number;
      low: number;
    };
    hazmat_incidents: number;
    total_victims: number;
    response_success_rate?: number;
    avg_resource_allocation_time?: number;
  };
  responseTimeTrends: Array<{
    date_interval: string;
    average_response_time: number;
    total_emergencies: number;
  }>;
  resourceEfficiency: Array<{
    resource_id: string;
    resource_name: string;
    utilization_rate: number;
    total_emergencies: number;
  }>;
}

const COLORS = ["#ef4444", "#f97316", "#22c55e"];

const AnalyticsDashboard = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");

  useEffect(() => {
    loadAnalytics();

    const subscription = supabase
      .channel("analytics-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "incident_reports",
        },
        () => loadAnalytics(),
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case "24h":
          startDate.setDate(startDate.getDate() - 1);
          break;
        case "7d":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(startDate.getDate() - 30);
          break;
      }

      const { data: incidentData } = await supabase.rpc(
        "get_incident_analytics",
        {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        },
      );

      const { data: trendData } = await supabase.rpc(
        "get_response_time_trends",
        {
          interval_days: timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : 30,
        },
      );

      const { data: resourceData } = await supabase.rpc(
        "get_resource_efficiency_metrics",
      );

      setData({
        incidentAnalytics: incidentData,
        responseTimeTrends: trendData || [],
        resourceEfficiency: resourceData || [],
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) return <div>Loading analytics...</div>;

  const severityData = [
    {
      name: "High",
      value: data.incidentAnalytics.severity_distribution.high,
    },
    {
      name: "Medium",
      value: data.incidentAnalytics.severity_distribution.medium,
    },
    {
      name: "Low",
      value: data.incidentAnalytics.severity_distribution.low,
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="space-x-2">
          <Badge
            variant={timeRange === "24h" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setTimeRange("24h")}
          >
            24h
          </Badge>
          <Badge
            variant={timeRange === "7d" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setTimeRange("7d")}
          >
            7d
          </Badge>
          <Badge
            variant={timeRange === "30d" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setTimeRange("30d")}
          >
            30d
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Response Trends</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Total Incidents
              </h3>
              <p className="text-2xl font-bold">
                {data.incidentAnalytics.total_incidents}
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Avg Response Time
              </h3>
              <p className="text-2xl font-bold">
                {data.incidentAnalytics.avg_response_time.toFixed(1)} min
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                HAZMAT Incidents
              </h3>
              <p className="text-2xl font-bold">
                {data.incidentAnalytics.hazmat_incidents}
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Total Victims
              </h3>
              <p className="text-2xl font-bold">
                {data.incidentAnalytics.total_victims}
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Success Rate
              </h3>
              <p className="text-2xl font-bold">
                {data.incidentAnalytics.response_success_rate?.toFixed(1)}%
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Avg Resource Allocation
              </h3>
              <p className="text-2xl font-bold">
                {data.incidentAnalytics.avg_resource_allocation_time?.toFixed(
                  1,
                )}{" "}
                min
              </p>
            </Card>
          </div>

          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">
              Severity Distribution
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {severityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Response Time Trends</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.responseTimeTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date_interval" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="average_response_time"
                    stroke="#8884d8"
                    name="Avg Response Time (min)"
                  />
                  <Line
                    type="monotone"
                    dataKey="total_emergencies"
                    stroke="#82ca9d"
                    name="Total Emergencies"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Resource Efficiency</h3>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {data.resourceEfficiency.map((resource) => (
                  <div
                    key={resource.resource_id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div>
                      <p className="font-medium">{resource.resource_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {resource.total_emergencies} emergencies handled
                      </p>
                    </div>
                    <Badge
                      variant={
                        resource.utilization_rate > 80
                          ? "destructive"
                          : resource.utilization_rate > 50
                            ? "default"
                            : "secondary"
                      }
                    >
                      {resource.utilization_rate.toFixed(1)}% Utilization
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AnalyticsDashboard;
