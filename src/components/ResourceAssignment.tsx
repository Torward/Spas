import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/lib/supabase";

interface Resource {
  id: string;
  name: string;
  type: string;
  status: "available" | "assigned" | "unavailable";
  location: string;
  specialization?: string[];
}

interface Assignment {
  id: string;
  resourceId: string;
  emergencyId: string;
  assignedAt: string;
  status: "pending" | "accepted" | "completed";
}

const ResourceAssignment = ({ emergencyId }: { emergencyId: string }) => {
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadResources();
    loadAssignments();

    const subscription = supabase
      .channel("resource-assignments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "emergency_resources",
        },
        () => {
          loadAssignments();
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [emergencyId]);

  const loadResources = async () => {
    const { data } = await supabase
      .from("resources")
      .select("*")
      .eq("status", "available");

    if (data) {
      setResources(data);
    }
  };

  const loadAssignments = async () => {
    const { data } = await supabase
      .from("emergency_resources")
      .select("*")
      .eq("emergency_id", emergencyId);

    if (data) {
      setAssignments(data);
    }
  };

  const handleAssign = async (resourceId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("emergency_resources").insert({
        emergency_id: emergencyId,
        resource_id: resourceId,
        assigned_at: new Date().toISOString(),
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Resource assigned successfully",
      });

      loadResources();
      loadAssignments();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to assign resource",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRelease = async (assignmentId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("emergency_resources")
        .update({
          released_at: new Date().toISOString(),
          status: "completed",
        })
        .eq("id", assignmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Resource released successfully",
      });

      loadResources();
      loadAssignments();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to release resource",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Resource Assignment</h3>
        <Badge variant="outline">{resources.length} Available</Badge>
      </div>

      <ScrollArea className="h-[200px]">
        <div className="space-y-2">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="flex items-center justify-between p-2 border rounded"
            >
              <div>
                <p className="font-medium">{resource.name}</p>
                <p className="text-sm text-muted-foreground">{resource.type}</p>
              </div>
              <Button
                size="sm"
                onClick={() => handleAssign(resource.id)}
                disabled={loading}
              >
                Assign
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-2">Active Assignments</h4>
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div>
                  <p className="font-medium">
                    Resource #{assignment.resourceId}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Assigned: {new Date(assignment.assignedAt).toLocaleString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRelease(assignment.id)}
                  disabled={loading}
                >
                  Release
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};

export default ResourceAssignment;
