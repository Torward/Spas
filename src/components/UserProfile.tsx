import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/lib/supabase";

interface UserProfileProps {
  userId: string;
  isDispatcher?: boolean;
}

const UserProfile = ({ userId, isDispatcher = false }: UserProfileProps) => {
  const { toast } = useToast();
  const [profile, setProfile] = React.useState({
    full_name: "",
    phone: "",
    position: "",
    department: "",
  });

  React.useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить профиль",
      });
      return;
    }

    if (data) {
      setProfile(data);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("id", userId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить профиль",
      });
      return;
    }

    toast({
      title: "Успех",
      description: "Профиль успешно обновлен",
    });
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Профиль пользователя</h2>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">ФИО</Label>
          <Input
            id="full_name"
            value={profile.full_name}
            onChange={(e) =>
              setProfile({ ...profile, full_name: e.target.value })
            }
            disabled={!isDispatcher}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Телефон</Label>
          <Input
            id="phone"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            disabled={!isDispatcher}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Должность</Label>
          <Input
            id="position"
            value={profile.position}
            onChange={(e) =>
              setProfile({ ...profile, position: e.target.value })
            }
            disabled={!isDispatcher}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Отдел</Label>
          <Input
            id="department"
            value={profile.department}
            onChange={(e) =>
              setProfile({ ...profile, department: e.target.value })
            }
            disabled={!isDispatcher}
          />
        </div>

        {isDispatcher && (
          <Button type="submit" className="w-full">
            Сохранить изменения
          </Button>
        )}
      </form>
    </Card>
  );
};

export default UserProfile;
