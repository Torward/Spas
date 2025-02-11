import React from "react";
import { Moon, Sun, Bell, User, Users, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface CommandHeaderProps {
  userName?: string;
  userRole?: string;
  systemStatus?: "operational" | "warning" | "critical";
  notifications?: Array<{ id: string; message: string }>;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
}

const CommandHeader = ({
  systemStatus = "operational",
  notifications = [
    { id: "1", message: "Новое экстренное оповещение" },
    { id: "2", message: "Команда Альфа направлена" },
  ],
  isDarkMode = true,
  onThemeToggle = () => {},
}: CommandHeaderProps) => {
  const { user, profile, isDispatcher, signOut } = useAuth();
  const userName = profile?.full_name || "Пользователь";
  const userRole = isDispatcher ? "Диспетчер" : "Респондент";
  const statusColors = {
    operational: "bg-green-500",
    warning: "bg-yellow-500",
    critical: "bg-red-500",
  };

  return (
    <header className="w-full h-16 bg-background border-b border-border px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">Центр управления ЧС</h1>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${statusColors[systemStatus]}`}
          />
          <span className="text-sm text-muted-foreground capitalize">
            {systemStatus}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onThemeToggle}>
                {isDarkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Переключить тему</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {notifications.length > 0 && (
                      <Badge
                        className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center"
                        variant="destructive"
                      >
                        {notifications.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Уведомления</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent align="end" className="w-64">
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification.id}>
                {notification.message}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
                />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{userName}</span>
                <span className="text-xs text-muted-foreground">
                  {userRole}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isDispatcher && (
              <DropdownMenuItem asChild>
                <Link to="/users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Управление пользователями
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Профиль
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Настройки
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 text-red-500"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default CommandHeader;
