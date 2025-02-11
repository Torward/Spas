export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      emergencies: {
        Row: {
          accuracy: number | null
          created_at: string | null
          id: string
          latitude: number
          longitude: number
          status: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accuracy?: number | null
          created_at?: string | null
          id?: string
          latitude: number
          longitude: number
          status: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accuracy?: number | null
          created_at?: string | null
          id?: string
          latitude?: number
          longitude?: number
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      emergency_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          emergency_id: string | null
          id: string
          responder_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          emergency_id?: string | null
          id?: string
          responder_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          emergency_id?: string | null
          id?: string
          responder_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_logs_emergency_id_fkey"
            columns: ["emergency_id"]
            isOneToOne: false
            referencedRelation: "emergencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_logs_responder_id_fkey"
            columns: ["responder_id"]
            isOneToOne: false
            referencedRelation: "responders"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_messages: {
        Row: {
          content: string
          created_at: string | null
          emergency_id: string | null
          id: string
          sender_id: string | null
          sender_name: string
        }
        Insert: {
          content: string
          created_at?: string | null
          emergency_id?: string | null
          id?: string
          sender_id?: string | null
          sender_name: string
        }
        Update: {
          content?: string
          created_at?: string | null
          emergency_id?: string | null
          id?: string
          sender_id?: string | null
          sender_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_messages_emergency_id_fkey"
            columns: ["emergency_id"]
            isOneToOne: false
            referencedRelation: "emergencies"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_metrics: {
        Row: {
          assigned_resources_count: number | null
          assigned_responders_count: number | null
          created_at: string | null
          emergency_id: string | null
          id: string
          resolution_time_seconds: number | null
          response_time_seconds: number | null
        }
        Insert: {
          assigned_resources_count?: number | null
          assigned_responders_count?: number | null
          created_at?: string | null
          emergency_id?: string | null
          id?: string
          resolution_time_seconds?: number | null
          response_time_seconds?: number | null
        }
        Update: {
          assigned_resources_count?: number | null
          assigned_responders_count?: number | null
          created_at?: string | null
          emergency_id?: string | null
          id?: string
          resolution_time_seconds?: number | null
          response_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_metrics_emergency_id_fkey"
            columns: ["emergency_id"]
            isOneToOne: false
            referencedRelation: "emergencies"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_resources: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          emergency_id: string | null
          id: string
          notes: string | null
          released_at: string | null
          resource_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          emergency_id?: string | null
          id?: string
          notes?: string | null
          released_at?: string | null
          resource_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          emergency_id?: string | null
          id?: string
          notes?: string | null
          released_at?: string | null
          resource_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_resources_emergency_id_fkey"
            columns: ["emergency_id"]
            isOneToOne: false
            referencedRelation: "emergencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_resources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_status_changes: {
        Row: {
          changed_by: string | null
          created_at: string | null
          emergency_id: string | null
          id: string
          new_status: string
          notes: string | null
          old_status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          emergency_id?: string | null
          id?: string
          new_status: string
          notes?: string | null
          old_status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          emergency_id?: string | null
          id?: string
          new_status?: string
          notes?: string | null
          old_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_status_changes_emergency_id_fkey"
            columns: ["emergency_id"]
            isOneToOne: false
            referencedRelation: "emergencies"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_metrics: {
        Row: {
          created_at: string | null
          id: string
          resource_id: string | null
          total_active_time_seconds: number | null
          total_assignments: number | null
          utilization_rate: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          resource_id?: string | null
          total_active_time_seconds?: number | null
          total_assignments?: number | null
          utilization_rate?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          resource_id?: string | null
          total_active_time_seconds?: number | null
          total_assignments?: number | null
          utilization_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_metrics_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          location: string | null
          name: string
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          location?: string | null
          name: string
          status: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          location?: string | null
          name?: string
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      responder_locations: {
        Row: {
          accuracy: number | null
          created_at: string | null
          heading: number | null
          id: string
          latitude: number
          longitude: number
          responder_id: string | null
          speed: number | null
        }
        Insert: {
          accuracy?: number | null
          created_at?: string | null
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          responder_id?: string | null
          speed?: number | null
        }
        Update: {
          accuracy?: number | null
          created_at?: string | null
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          responder_id?: string | null
          speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "responder_locations_responder_id_fkey"
            columns: ["responder_id"]
            isOneToOne: false
            referencedRelation: "responders"
            referencedColumns: ["id"]
          },
        ]
      }
      responder_metrics: {
        Row: {
          average_response_time_seconds: number | null
          created_at: string | null
          emergencies_attended: number | null
          id: string
          responder_id: string | null
          total_active_time_seconds: number | null
        }
        Insert: {
          average_response_time_seconds?: number | null
          created_at?: string | null
          emergencies_attended?: number | null
          id?: string
          responder_id?: string | null
          total_active_time_seconds?: number | null
        }
        Update: {
          average_response_time_seconds?: number | null
          created_at?: string | null
          emergencies_attended?: number | null
          id?: string
          responder_id?: string | null
          total_active_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "responder_metrics_responder_id_fkey"
            columns: ["responder_id"]
            isOneToOne: false
            referencedRelation: "responders"
            referencedColumns: ["id"]
          },
        ]
      }
      responders: {
        Row: {
          created_at: string | null
          current_emergency_id: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          status: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_emergency_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          status: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_emergency_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "responders_current_emergency_id_fkey"
            columns: ["current_emergency_id"]
            isOneToOne: false
            referencedRelation: "emergencies"
            referencedColumns: ["id"]
          },
        ]
      }
      webrtc_signaling: {
        Row: {
          created_at: string | null
          data: Json
          emergency_id: string | null
          id: string
          type: string
        }
        Insert: {
          created_at?: string | null
          data: Json
          emergency_id?: string | null
          id?: string
          type: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          emergency_id?: string | null
          id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "webrtc_signaling_emergency_id_fkey"
            columns: ["emergency_id"]
            isOneToOne: false
            referencedRelation: "emergencies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      emergency_response_summary: {
        Row: {
          avg_response_time: number | null
          emergency_type: string | null
          resolved_emergencies: number | null
          resources_used: number | null
          responders_assigned: number | null
          response_date: string | null
          total_emergencies: number | null
        }
        Relationships: []
      }
      resource_utilization_view: {
        Row: {
          active_resources: number | null
          avg_utilization_rate: number | null
          current_status: string | null
          resource_type: string | null
          total_assignments: number | null
          total_resources: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_analytics_summary: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_emergency_type_distribution: {
        Args: {
          start_date?: string
          end_date?: string
        }
        Returns: {
          emergency_type: string
          count: number
          percentage: number
        }[]
      }
      get_resource_efficiency_metrics: {
        Args: Record<PropertyKey, never>
        Returns: {
          resource_id: string
          resource_name: string
          utilization_rate: number
          average_assignment_duration: unknown
          total_emergencies: number
        }[]
      }
      get_responder_performance_metrics: {
        Args: Record<PropertyKey, never>
        Returns: {
          responder_id: string
          responder_name: string
          total_emergencies: number
          average_response_time: number
          successful_resolutions: number
          current_status: string
        }[]
      }
      get_response_time_trends: {
        Args: {
          interval_days?: number
        }
        Returns: {
          date_interval: string
          average_response_time: number
          total_emergencies: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
