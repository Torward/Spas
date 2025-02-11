import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface User {
  id: string;
  email: string;
  role: string;
  full_name: string;
  department: string;
}

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select(`
        id,
        full_name,
        department,
        users:id (email, role)
      `);

    if (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить список пользователей",
      });
      return;
    }

    if (data) {
      setUsers(
        data.map((item: any) => ({
          id: item.id,
          email: item.users.email,
          role: item.users.role,
          full_name: item.full_name,
          department: item.department,
        })),
      );
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase.rpc("change_user_role", {
      user_id: userId,
      new_role: newRole,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось изменить роль пользователя",
      });
      return;
    }

    toast({
      title: "Успех",
      description: "Роль пользователя успешно изменена",
    });
    loadUsers();
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Управление пользователями</h2>
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ФИО</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Отдел</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.department}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleRoleChange(
                        user.id,
                        user.role === "dispatcher" ? "responder" : "dispatcher",
                      )
                    }
                  >
                    {user.role === "dispatcher"
                      ? "Сделать респондером"
                      : "Сделать диспетчером"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
};

export default UserManagement;
