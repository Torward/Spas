import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Vehicle {
  id: string;
  type: string;
  number: string;
  department: string;
}

interface VehiclesListProps {
  vehicles: Vehicle[];
  onAdd: (vehicle: Omit<Vehicle, "id">) => void;
  onRemove: (id: string) => void;
}

const VehiclesList = ({ vehicles, onAdd, onRemove }: VehiclesListProps) => {
  const [newVehicle, setNewVehicle] = React.useState({
    type: "",
    number: "",
    department: "",
  });

  const handleAdd = () => {
    if (newVehicle.type && newVehicle.number) {
      onAdd(newVehicle);
      setNewVehicle({ type: "", number: "", department: "" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <Select
          value={newVehicle.type}
          onValueChange={(value) =>
            setNewVehicle({ ...newVehicle, type: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Тип техники" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="АЦ">АЦ</SelectItem>
            <SelectItem value="АЛ">АЛ</SelectItem>
            <SelectItem value="АСА">АСА</SelectItem>
            <SelectItem value="ПНС">ПНС</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Номер"
          value={newVehicle.number}
          onChange={(e) =>
            setNewVehicle({ ...newVehicle, number: e.target.value })
          }
        />
        <Input
          placeholder="Подразделение"
          value={newVehicle.department}
          onChange={(e) =>
            setNewVehicle({ ...newVehicle, department: e.target.value })
          }
        />
      </div>
      <Button onClick={handleAdd} className="w-full">
        Добавить технику
      </Button>

      <div className="space-y-2">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="flex items-center justify-between p-2 border rounded"
          >
            <div>
              <span className="font-medium">{vehicle.type} </span>
              <span className="text-sm text-muted-foreground">
                {vehicle.number} ({vehicle.department})
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRemove(vehicle.id)}
            >
              Удалить
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehiclesList;
