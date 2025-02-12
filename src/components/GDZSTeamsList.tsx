import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface GDZSTeam {
  id: string;
  teamNumber: number;
  workDuration: number;
}

interface GDZSTeamsListProps {
  teams: GDZSTeam[];
  onAdd: (team: Omit<GDZSTeam, "id">) => void;
  onRemove: (id: string) => void;
}

const GDZSTeamsList = ({ teams, onAdd, onRemove }: GDZSTeamsListProps) => {
  const [newTeam, setNewTeam] = React.useState({
    teamNumber: teams.length + 1,
    workDuration: 0,
  });

  const handleAdd = () => {
    if (newTeam.workDuration > 0) {
      onAdd(newTeam);
      setNewTeam({ teamNumber: teams.length + 2, workDuration: 0 });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          placeholder="Номер звена"
          value={newTeam.teamNumber}
          onChange={(e) =>
            setNewTeam({ ...newTeam, teamNumber: parseInt(e.target.value) })
          }
        />
        <Input
          type="number"
          placeholder="Время работы (мин)"
          value={newTeam.workDuration}
          onChange={(e) =>
            setNewTeam({ ...newTeam, workDuration: parseInt(e.target.value) })
          }
        />
      </div>
      <Button onClick={handleAdd} className="w-full">
        Добавить звено ГДЗС
      </Button>

      <div className="space-y-2">
        {teams.map((team) => (
          <div
            key={team.id}
            className="flex items-center justify-between p-2 border rounded"
          >
            <div>
              <span className="font-medium">Звено №{team.teamNumber} </span>
              <span className="text-sm text-muted-foreground">
                ({team.workDuration} мин)
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRemove(team.id)}
            >
              Удалить
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GDZSTeamsList;
