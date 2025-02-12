import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { supabase } from "@/lib/supabase";

interface Notification {
  id: string;
  type: "emergency" | "system" | "update";
  message: string;
  created_at: string;
  read: boolean;
}

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load initial notifications
    loadNotifications();

    // Subscribe to new notifications
    const subscription = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          if (!newNotification.read) {
            setUnreadCount((prev) => prev + 1);
            // Show browser notification
            showBrowserNotification(newNotification);
          }
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    }
  };

  const showBrowserNotification = (notification: Notification) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Новое уведомление", {
        body: notification.message,
        icon: "/notification-icon.png",
      });
    }
  };

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);

    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {notifications.map((notification) => (
          <DropdownMenuItem
            key={notification.id}
            className={`flex flex-col items-start p-2 ${!notification.read ? "bg-muted/50" : ""}`}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="font-medium">{notification.message}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(notification.created_at).toLocaleString()}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationSystem;
