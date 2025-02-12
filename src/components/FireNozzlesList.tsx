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

interface FireNozzle {
  id: string;
  type: string;
  count: number;
}

interface FireNozzlesListProps {
  nozzles: FireNozzle[];
  onAdd: (nozzle: Omit<FireNozzle, "id">) => void;
  onRemove: (id: string) => void;
}

const FireNozzlesList = ({
  nozzles,
  onAdd,
  onRemove,
}: FireNozzlesListProps) => {
  const [newNozzle, setNewNozzle] = React.useState({
    type: "",
    count: 1,
  });

  const handleAdd = () => {
    if (newNozzle.type && newNozzle.count > 0) {
      onAdd(newNozzle);
      setNewNozzle({ type: "", count: 1 });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Select
          value={newNozzle.type}
          onValueChange={(value) => setNewNozzle({ ...newNozzle, type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Тип ствола" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ручной_ствол_А">РС-А</SelectItem>
            <SelectItem value="ручной_ствол_Б">РС-Б</SelectItem>
            <SelectItem value="ствол_РСК">РСК</SelectItem>
            <SelectItem value="ствол_ЛС">ЛС</SelectItem>
            <SelectItem value="пеногенератор">ПГ</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Количество"
          value={newNozzle.count}
          onChange={(e) =>
            setNewNozzle({ ...newNozzle, count: parseInt(e.target.value) })
          }
          min={1}
        />
      </div>
      <Button onClick={handleAdd} className="w-full">
        Добавить ствол
      </Button>

      <div className="space-y-2">
        {nozzles.map((nozzle) => (
          <div
            key={nozzle.id}
            className="flex items-center justify-between p-2 border rounded"
          >
            <div>
              <span className="font-medium">{nozzle.type} </span>
              <span className="text-sm text-muted-foreground">
                ({nozzle.count} шт)
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRemove(nozzle.id)}
            >
              Удалить
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FireNozzlesList;
