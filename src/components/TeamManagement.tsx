import React, { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Users, UserPlus, Phone, MapPin } from "lucide-react";

interface Team {
  id: string;
  name: string;
  status: "available" | "assigned" | "unavailable";
  current_location?: { lat: number; lng: number };
  members: TeamMember[];
  specialization?: string;
  last_active?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  status: "active" | "inactive";
}

const TeamManagement = () => {
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTeam, setNewTeam] = useState({
    name: "",
    specialization: "",
  });

  useEffect(() => {
    loadTeams();

    const subscription = supabase
      .channel("teams-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "emergency_teams",
        },
        () => loadTeams(),
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadTeams = async () => {
    try {
      const { data, error } = await supabase
        .from("emergency_teams")
        .select(
          `
          *,
          members:team_members(*)
        `,
        )
        .order("name");

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error("Error loading teams:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load teams",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async () => {
    try {
      const { error } = await supabase.from("emergency_teams").insert([
        {
          name: newTeam.name,
          specialization: newTeam.specialization,
          status: "available",
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team created successfully",
      });

      setNewTeam({ name: "", specialization: "" });
    } catch (error) {
      console.error("Error creating team:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create team",
      });
    }
  };

  const updateTeamStatus = async (teamId: string, status: Team["status"]) => {
    try {
      const { error } = await supabase
        .from("emergency_teams")
        .update({ status })
        .eq("id", teamId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team status updated",
      });
    } catch (error) {
      console.error("Error updating team status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update team status",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Emergency Response Teams</h2>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              New Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Team Name</Label>
                <Input
                  value={newTeam.name}
                  onChange={(e) =>
                    setNewTeam({ ...newTeam, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Input
                  value={newTeam.specialization}
                  onChange={(e) =>
                    setNewTeam({ ...newTeam, specialization: e.target.value })
                  }
                />
              </div>
              <Button onClick={createTeam} className="w-full">
                Create Team
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {teams.map((team) => (
            <Card key={team.id} className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{team.name}</h3>
                    <Badge
                      variant={
                        team.status === "available"
                          ? "default"
                          : team.status === "assigned"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {team.status}
                    </Badge>
                  </div>
                  {team.specialization && (
                    <p className="text-sm text-muted-foreground">
                      {team.specialization}
                    </p>
                  )}
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateTeamStatus(team.id, "available")}
                    disabled={team.status === "available"}
                  >
                    Set Available
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateTeamStatus(team.id, "unavailable")}
                    disabled={team.status === "unavailable"}
                  >
                    Set Unavailable
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {team.current_location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {team.current_location.lat.toFixed(6)},{" "}
                      {team.current_location.lng.toFixed(6)}
                    </span>
                  </div>
                )}

                <div className="border rounded-lg p-2">
                  <h4 className="text-sm font-medium mb-2">Team Members</h4>
                  <div className="space-y-2">
                    {team.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-muted-foreground">{member.role}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              member.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {member.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(`tel:${member.phone}`)}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default TeamManagement;
