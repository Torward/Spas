import React from "react";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import {
  Activity,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface StatusDashboardProps {
  activeIncidents?: number;
  availableResources?: number;
  averageResponseTime?: number;
  incidentsByPriority?: {
    high: number;
    medium: number;
    low: number;
  };
  resourceUtilization?: number;
}

const StatusDashboard = ({
  activeIncidents = 12,
  availableResources = 24,
  averageResponseTime = 8.5,
  incidentsByPriority = { high: 4, medium: 5, low: 3 },
  resourceUtilization = 75,
}: StatusDashboardProps) => {
  return (
    <div className="w-full bg-background p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Incidents Card */}
        <Card className="p-4 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
            <Activity className="h-6 w-6 text-red-600 dark:text-red-300" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Активные происшествия
            </p>
            <h3 className="text-2xl font-bold">{activeIncidents}</h3>
          </div>
        </Card>

        {/* Available Resources Card */}
        <Card className="p-4 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Доступные ресурсы</p>
            <h3 className="text-2xl font-bold">{availableResources}</h3>
          </div>
        </Card>

        {/* Average Response Time Card */}
        <Card className="p-4 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
            <Clock className="h-6 w-6 text-green-600 dark:text-green-300" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Среднее время реагирования
            </p>
            <h3 className="text-2xl font-bold">{averageResponseTime} min</h3>
          </div>
        </Card>

        {/* Resource Utilization Card */}
        <Card className="p-4 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
            <Loader2 className="h-6 w-6 text-purple-600 dark:text-purple-300" />
          </div>
          <div className="w-full">
            <p className="text-sm text-muted-foreground">
              Использование ресурсов
            </p>
            <Progress value={resourceUtilization} className="mt-2" />
            <p className="text-sm mt-1">{resourceUtilization}%</p>
          </div>
        </Card>
      </div>

      {/* Incidents by Priority */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          Происшествия по приоритету
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Высокий приоритет</span>
            </div>
            <span className="font-bold">{incidentsByPriority.high}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span>Средний приоритет</span>
            </div>
            <span className="font-bold">{incidentsByPriority.medium}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Низкий приоритет</span>
            </div>
            <span className="font-bold">{incidentsByPriority.low}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatusDashboard;
