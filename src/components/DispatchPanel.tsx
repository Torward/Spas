import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Clock, MapPin, Users } from "lucide-react";

interface Incident {
  id: string;
  title: string;
  location: string;
  priority: "high" | "medium" | "low";
  timestamp: string;
  assignedTeam?: string;
}

interface DispatchPanelProps {
  incidents?: Incident[];
  onAssignTeam?: (incidentId: string, teamId: string) => void;
}

const defaultIncidents: Incident[] = [
  {
    id: "1",
    title: "Medical Emergency",
    location: "Downtown Area",
    priority: "high",
    timestamp: "2024-03-21T10:30:00Z",
  },
  {
    id: "2",
    title: "Fire Incident",
    location: "Industrial Zone",
    priority: "medium",
    timestamp: "2024-03-21T10:15:00Z",
  },
  {
    id: "3",
    title: "Traffic Accident",
    location: "Highway Junction",
    priority: "low",
    timestamp: "2024-03-21T09:45:00Z",
  },
];

const mockTeams = [
  { id: "team1", name: "Alpha Team" },
  { id: "team2", name: "Beta Team" },
  { id: "team3", name: "Delta Team" },
];

const DispatchPanel: React.FC<DispatchPanelProps> = ({
  incidents = defaultIncidents,
  onAssignTeam = () => {},
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="w-[400px] h-[600px] bg-background border-border p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Панель диспетчера</h2>
        <Badge variant="outline" className="px-2 py-1">
          {incidents.length} Активных
        </Badge>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4">
          {incidents.map((incident) => (
            <Card key={incident.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{incident.title}</h3>
                <Badge className={`${getPriorityColor(incident.priority)}`}>
                  {incident.priority}
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{incident.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(incident.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Назначить команду
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Назначить команду реагирования
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Выберите команду для реагирования на происшествие.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <Select
                    onValueChange={(teamId) =>
                      onAssignTeam(incident.id, teamId)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите команду" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTeams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction>
                      Подтвердить назначение
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default DispatchPanel;
