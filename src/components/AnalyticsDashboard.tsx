import React, { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { supabase } from "@/lib/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  responseTimeTrends: Array<{
    date_interval: string;
    average_response_time: number;
    total_emergencies: number;
  }>;
  emergencyTypeDistribution: Array<{
    emergency_type: string;
    count: number;
    percentage: number;
  }>;
  resourceEfficiency: Array<{
    resource_id: string;
    resource_name: string;
    utilization_rate: number;
    average_assignment_duration: number;
    total_emergencies: number;
  }>;
}

const AnalyticsDashboard = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [responseTimes, typeDistribution, resourceEfficiency] =
        await Promise.all([
          supabase.rpc("get_response_time_trends", { interval_days: 30 }),
          supabase.rpc("get_emergency_type_distribution"),
          supabase.rpc("get_resource_efficiency_metrics"),
        ]);

      setData({
        responseTimeTrends: responseTimes.data || [],
        emergencyTypeDistribution: typeDistribution.data || [],
        resourceEfficiency: resourceEfficiency.data || [],
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Среднее время реагирования
        </h3>
        <div className="h-[300px]">
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
                name="Среднее время (мин)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Распределение по типам</h3>
          <div className="space-y-2">
            {data.emergencyTypeDistribution.map((item) => (
              <div
                key={item.emergency_type}
                className="flex justify-between items-center"
              >
                <span>{item.emergency_type}</span>
                <span>{item.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Эффективность ресурсов</h3>
          <div className="space-y-2">
            {data.resourceEfficiency.map((item) => (
              <div
                key={item.resource_id}
                className="flex justify-between items-center"
              >
                <span>{item.resource_name}</span>
                <span>{item.utilization_rate.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
