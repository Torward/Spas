import React, { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  MessageSquare,
  Phone,
  PhoneOff,
  Send,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { WebRTCConnection } from "@/lib/webrtc";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  type: "text" | "system";
}

interface CommunicationHubProps {
  emergencyId?: string;
  messages?: Message[];
  isInCall?: boolean;
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
}

const defaultMessages: Message[] = [
  {
    id: "1",
    sender: "System",
    content: "Emergency response team dispatched to location",
    timestamp: "10:30 AM",
    type: "system",
  },
];

const CommunicationHub = ({
  emergencyId = "default",
  messages: initialMessages = defaultMessages,
  isInCall = false,
  isVideoEnabled = true,
  isAudioEnabled = true,
}: CommunicationHubProps) => {
  const [messages, setMessages] = useState(initialMessages);
  const [activeCall, setActiveCall] = useState(isInCall);
  const [videoEnabled, setVideoEnabled] = useState(isVideoEnabled);
  const [audioEnabled, setAudioEnabled] = useState(isAudioEnabled);
  const [newMessage, setNewMessage] = useState("");

  const webrtcRef = useRef<WebRTCConnection>();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const messageSubscription = supabase
      .channel(`emergency-${emergencyId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "emergency_messages",
          filter: `emergency_id=eq.${emergencyId}`,
        },
        (payload) => {
          const newMessage = payload.new;
          setMessages((prev) => [
            ...prev,
            {
              id: newMessage.id,
              sender: newMessage.sender_name,
              content: newMessage.content,
              timestamp: new Date(newMessage.created_at).toLocaleTimeString(),
              type: "text",
            },
          ]);
        },
      )
      .subscribe();

    return () => {
      messageSubscription.unsubscribe();
    };
  }, [emergencyId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await supabase.from("emergency_messages").insert({
        emergency_id: emergencyId,
        content: newMessage,
        sender_name: "Dispatcher", // This should come from auth context
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleStartCall = async () => {
    try {
      webrtcRef.current = new WebRTCConnection(emergencyId);
      const localStream = await webrtcRef.current.startCall(true);
      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream;
      }
      setActiveCall(true);
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  const handleStopCall = () => {
    webrtcRef.current?.stopCall();
    setActiveCall(false);
  };

  return (
    <Card className="w-[400px] h-[600px] bg-background border-border">
      <Tabs defaultValue="video" className="w-full h-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="video">Видео</TabsTrigger>
          <TabsTrigger value="audio">Аудио</TabsTrigger>
          <TabsTrigger value="messages">Сообщения</TabsTrigger>
        </TabsList>

        <TabsContent value="video" className="h-[calc(100%-40px)]">
          <div className="relative w-full h-full flex flex-col">
            <div className="flex-1 bg-muted rounded-md m-2 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                {!activeCall ? (
                  <p className="text-muted-foreground">Начать видеозвонок</p>
                ) : (
                  <div className="w-full h-full bg-black/50 flex flex-col gap-4">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-1/3 absolute top-4 right-4 rounded-lg"
                    />
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 flex justify-center space-x-4">
              <Button
                variant={audioEnabled ? "default" : "destructive"}
                size="icon"
                onClick={() => setAudioEnabled(!audioEnabled)}
              >
                {audioEnabled ? <Mic /> : <MicOff />}
              </Button>
              <Button
                variant={activeCall ? "destructive" : "default"}
                size="icon"
                onClick={activeCall ? handleStopCall : handleStartCall}
              >
                {activeCall ? <PhoneOff /> : <Phone />}
              </Button>
              <Button
                variant={videoEnabled ? "default" : "destructive"}
                size="icon"
                onClick={() => setVideoEnabled(!videoEnabled)}
              >
                {videoEnabled ? <Video /> : <VideoOff />}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audio" className="h-[calc(100%-40px)]">
          <div className="h-full flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <Avatar className="w-32 h-32">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=responder"
                  alt="Responder"
                />
              </Avatar>
            </div>
            <div className="p-4 flex justify-center space-x-4">
              <Button
                variant={audioEnabled ? "default" : "destructive"}
                size="icon"
                onClick={() => setAudioEnabled(!audioEnabled)}
              >
                {audioEnabled ? <Mic /> : <MicOff />}
              </Button>
              <Button
                variant={activeCall ? "destructive" : "default"}
                size="icon"
                onClick={activeCall ? handleStopCall : handleStartCall}
              >
                {activeCall ? <PhoneOff /> : <Phone />}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="messages" className="h-[calc(100%-40px)]">
          <div className="h-full flex flex-col">
            <ScrollArea className="flex-1 p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 ${message.type === "system" ? "text-center" : ""}`}
                >
                  {message.type === "system" ? (
                    <Badge variant="secondary" className="mb-2">
                      {message.content}
                    </Badge>
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="w-6 h-6">
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender}`}
                            alt={message.sender}
                          />
                        </Avatar>
                        <span className="text-sm font-medium">
                          {message.sender}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp}
                        </span>
                      </div>
                      <p className="text-sm pl-8">{message.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </ScrollArea>

            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Введите сообщение..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default CommunicationHub;
