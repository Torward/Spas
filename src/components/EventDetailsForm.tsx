import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/lib/supabase";

interface EventDetailsFormProps {
  emergencyId: string;
  latitude: number;
  longitude: number;
}

interface FormData {
  event_number: string;
  event_type: string;
  signal_received_at: string;
  departure_time: string;
  arrival_time: string;
  fire_localization_time: string;
  open_fire_elimination_time: string;
  consequences_elimination_time: string;
  fire_area: number;
  units_involved: number;
  casualties_count: number;
  nearest_address: string;
  distance_to_fire_station: number;
}

const EventDetailsForm = ({
  emergencyId,
  latitude,
  longitude,
}: EventDetailsFormProps) => {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>();
  const watchedTimes = watch([
    "signal_received_at",
    "departure_time",
    "arrival_time",
    "fire_localization_time",
    "open_fire_elimination_time",
    "consequences_elimination_time",
  ]);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<{ id: string; count: number }[]>([]);
  const [teams, setTeams] = useState<{ id: string; duration: number }[]>([]);
  const [nozzles, setNozzles] = useState<{ type: string; count: number }[]>([]);

  useEffect(() => {
    // Автоматически заполняем данные с карты
    setValue("signal_received_at", new Date().toISOString());
    setValue("latitude", latitude);
    setValue("longitude", longitude);

    // Получаем ближайший адрес через геокодирование
    fetchNearestAddress(latitude, longitude);
    // Рассчитываем расстояние до ближайшей пожарной части
    calculateDistanceToFireStation(latitude, longitude);
  }, [latitude, longitude]);

  const fetchNearestAddress = async (lat: number, lng: number) => {
    try {
      // Здесь можно использовать сервис геокодирования
      // Например, OpenStreetMap Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      const data = await response.json();
      setValue("nearest_address", data.display_name);
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  const calculateDistanceToFireStation = async (lat: number, lng: number) => {
    try {
      const { data: stations } = await supabase
        .from("fire_stations")
        .select("latitude, longitude")
        .limit(1);

      if (stations?.[0]) {
        const distance = calculateHaversineDistance(
          lat,
          lng,
          stations[0].latitude,
          stations[0].longitude,
        );
        setValue("distance_to_fire_station", distance);
      }
    } catch (error) {
      console.error("Error calculating distance:", error);
    }
  };

  const calculateHaversineDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371; // Радиус Земли в км
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // Сохраняем основные данные о событии
      const { data: eventDetail, error } = await supabase
        .from("event_details")
        .insert([
          {
            emergency_id: emergencyId,
            ...data,
            created_by: (await supabase.auth.getUser()).data.user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Сохраняем данные о задействованных машинах
      if (vehicles.length > 0) {
        await supabase.from("involved_vehicles").insert(
          vehicles.map((v) => ({
            event_detail_id: eventDetail.id,
            ...v,
          })),
        );
      }

      // Сохраняем данные о звеньях ГДЗС
      if (teams.length > 0) {
        await supabase.from("breathing_apparatus_teams").insert(
          teams.map((t) => ({
            event_detail_id: eventDetail.id,
            ...t,
          })),
        );
      }

      // Сохраняем данные об использованных стволах
      if (nozzles.length > 0) {
        await supabase.from("fire_nozzles_used").insert(
          nozzles.map((n) => ({
            event_detail_id: eventDetail.id,
            ...n,
          })),
        );
      }

      toast({
        title: "Успех",
        description: "Данные о событии сохранены",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить данные",
      });
    } finally {
      setLoading(false);
    }
  };

  // Валидация временных меток
  const validateTimes = (data: FormData) => {
    const times = [
      { name: "signal_received_at", value: data.signal_received_at },
      { name: "departure_time", value: data.departure_time },
      { name: "arrival_time", value: data.arrival_time },
      { name: "fire_localization_time", value: data.fire_localization_time },
      {
        name: "open_fire_elimination_time",
        value: data.open_fire_elimination_time,
      },
      {
        name: "consequences_elimination_time",
        value: data.consequences_elimination_time,
      },
    ].filter((t) => t.value);

    for (let i = 1; i < times.length; i++) {
      if (new Date(times[i].value) < new Date(times[i - 1].value)) {
        return `${times[i].name} не может быть раньше ${times[i - 1].name}`;
      }
    }
    return null;
  };

  return (
    <Card className="p-6 max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Номер события</Label>
            <Input {...register("event_number")} required />
          </div>

          <div className="space-y-2">
            <Label>Тип события</Label>
            <Select onValueChange={(value) => setValue("event_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fire">Пожар</SelectItem>
                <SelectItem value="emergency">ЧС</SelectItem>
                <SelectItem value="rescue">Спасательные работы</SelectItem>
                <SelectItem value="medical">Медицинская помощь</SelectItem>
                <SelectItem value="hazmat">ХОПО</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Время получения сигнала</Label>
            <Input
              type="datetime-local"
              {...register("signal_received_at")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Время выезда</Label>
            <Input type="datetime-local" {...register("departure_time")} />
          </div>

          <div className="space-y-2">
            <Label>Время прибытия</Label>
            <Input type="datetime-local" {...register("arrival_time")} />
          </div>

          <div className="space-y-2">
            <Label>Время локализации</Label>
            <Input
              type="datetime-local"
              {...register("fire_localization_time")}
            />
          </div>

          <div className="space-y-2">
            <Label>Время ликвидации открытого горения</Label>
            <Input
              type="datetime-local"
              {...register("open_fire_elimination_time")}
            />
          </div>

          <div className="space-y-2">
            <Label>Время ликвидации последствий</Label>
            <Input
              type="datetime-local"
              {...register("consequences_elimination_time")}
            />
          </div>

          <div className="space-y-2">
            <Label>Площадь пожара (м²)</Label>
            <Input type="number" {...register("fire_area")} />
          </div>

          <div className="space-y-2">
            <Label>Количество отделений</Label>
            <Input type="number" {...register("units_involved")} />
          </div>

          <div className="space-y-2">
            <Label>Количество пострадавших</Label>
            <Input
              type="number"
              {...register("casualties_count")}
              defaultValue={0}
            />
          </div>

          <div className="space-y-2">
            <Label>Ближайший адрес</Label>
            <Input {...register("nearest_address")} />
          </div>

          <div className="space-y-2">
            <Label>Расстояние до ПЧ (км)</Label>
            <Input
              type="number"
              step="0.1"
              {...register("distance_to_fire_station")}
            />
          </div>
        </div>

        <div className="space-y-6 mt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Задействованная техника</h3>
            <VehiclesList
              vehicles={vehicles}
              onAdd={(vehicle) =>
                setVehicles([
                  ...vehicles,
                  { ...vehicle, id: Math.random().toString() },
                ])
              }
              onRemove={(id) =>
                setVehicles(vehicles.filter((v) => v.id !== id))
              }
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Звенья ГДЗС</h3>
            <GDZSTeamsList
              teams={teams}
              onAdd={(team) =>
                setTeams([...teams, { ...team, id: Math.random().toString() }])
              }
              onRemove={(id) => setTeams(teams.filter((t) => t.id !== id))}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Пожарные стволы</h3>
            <FireNozzlesList
              nozzles={nozzles}
              onAdd={(nozzle) =>
                setNozzles([
                  ...nozzles,
                  { ...nozzle, id: Math.random().toString() },
                ])
              }
              onRemove={(id) => setNozzles(nozzles.filter((n) => n.id !== id))}
            />
          </div>
        </div>

        {errors.root?.message && (
          <div className="text-red-500 mt-2">{errors.root.message}</div>
        )}

        <Button type="submit" disabled={loading} className="mt-6">
          {loading ? "Сохранение..." : "Сохранить"}
        </Button>
      </form>
    </Card>
  );
};

export default EventDetailsForm;
