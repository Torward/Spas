import { supabase } from "../supabase";

export interface EmergencyRequest {
  latitude: number;
  longitude: number;
  type: string;
  description?: string;
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

export interface VictimProfile {
  id: string;
  fullName: string;
  phone: string;
  medicalInfo?: string;
  emergencyContacts?: string[];
}

export interface ResponderProfile {
  id: string;
  fullName: string;
  phone: string;
  specialization: string;
  certifications?: string[];
  activeStatus: "available" | "busy" | "offline";
}

export interface EmergencyDetails {
  id: string;
  type: string;
  subtype?: string;
  severity: "low" | "medium" | "high";
  victimCount?: number;
  medicalAttentionRequired?: boolean;
  hazmatPresent?: boolean;
}

export interface EmergencyMedia {
  id: string;
  type: "photo" | "video" | "audio";
  url: string;
  timestamp: string;
  metadata?: {
    duration?: number;
    size?: number;
    mimeType?: string;
  };
}

export interface HazardReport {
  id: string;
  type: string;
  severity: "low" | "medium" | "high";
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export class MobileAPI {
  private static async validateToken(token: string) {
    const { data, error } = await supabase.rpc("validate_api_token", {
      p_token: token,
    });

    if (error) throw new Error("Invalid token");
    return data;
  }

  static async updateLocation(token: string, location: LocationUpdate) {
    const validation = await this.validateToken(token);
    if (!validation?.is_valid) throw new Error("Invalid token");

    const { error } = await supabase.from("mobile_locations").insert({
      user_id: validation.user_id,
      ...location,
    });

    if (error) throw error;

    // If it's a responder, also update their current location
    if (validation.device_type === "responder") {
      await supabase
        .from("responders")
        .update({
          latitude: location.latitude,
          longitude: location.longitude,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", validation.user_id);
    }
  }

  static async requestEmergencyHelp(token: string, request: EmergencyRequest) {
    const validation = await this.validateToken(token);
    if (!validation?.is_valid || validation.device_type !== "victim") {
      throw new Error("Invalid token or unauthorized device type");
    }

    const { data, error } = await supabase
      .from("emergencies")
      .insert({
        latitude: request.latitude,
        longitude: request.longitude,
        type: request.type,
        status: "pending",
        user_id: validation.user_id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateEmergencyStatus(
    token: string,
    emergencyId: string,
    status: string,
  ) {
    const validation = await this.validateToken(token);
    if (!validation?.is_valid || validation.device_type !== "responder") {
      throw new Error("Invalid token or unauthorized device type");
    }

    const { error } = await supabase.from("emergency_status_changes").insert({
      emergency_id: emergencyId,
      changed_by: validation.user_id,
      new_status: status,
      old_status: "pending", // This should be fetched from current status
    });

    if (error) throw error;

    await supabase.from("emergencies").update({ status }).eq("id", emergencyId);
  }

  static async getActiveEmergency(token: string) {
    const validation = await this.validateToken(token);
    if (!validation?.is_valid) throw new Error("Invalid token");

    const { data, error } = await supabase
      .from("emergencies")
      .select(
        `
        *,
        emergency_resources (*),
        emergency_messages (*)
      `,
      )
      .eq(
        validation.device_type === "victim"
          ? "user_id"
          : "current_responder_id",
        validation.user_id,
      )
      .eq("status", "active")
      .single();

    if (error) throw error;
    return data;
  }

  static async sendMessage(
    token: string,
    emergencyId: string,
    content: string,
  ) {
    const validation = await this.validateToken(token);
    if (!validation?.is_valid) throw new Error("Invalid token");

    const { error } = await supabase.from("emergency_messages").insert({
      emergency_id: emergencyId,
      content,
      sender_id: validation.user_id,
      sender_name:
        validation.device_type === "victim" ? "Пострадавший" : "Спасатель",
    });

    if (error) throw error;
  }

  static async registerVictim(
    profile: Omit<VictimProfile, "id">,
  ): Promise<string> {
    const { data: user, error: userError } = await supabase.auth.signUp({
      email: `${profile.phone}@emergency.app`,
      password: Math.random().toString(36).slice(-8),
    });

    if (userError) throw userError;

    const { data: token, error: tokenError } = await supabase.rpc(
      "create_api_token",
      {
        p_user_id: user.user?.id,
        p_device_id: Math.random().toString(36).slice(-8),
        p_device_type: "victim",
        role: "victim",
      },
    );

    if (tokenError) throw tokenError;

    await supabase.from("victim_profiles").insert({
      user_id: user.user?.id,
      ...profile,
    });

    return token;
  }

  static async registerResponder(
    profile: Omit<ResponderProfile, "id" | "activeStatus">,
  ): Promise<string> {
    const { data: user, error: userError } = await supabase.auth.signUp({
      email: `${profile.phone}@emergency.app`,
      password: Math.random().toString(36).slice(-8),
    });

    if (userError) throw userError;

    const { data: token, error: tokenError } = await supabase.rpc(
      "create_api_token",
      {
        p_user_id: user.user?.id,
        p_device_id: Math.random().toString(36).slice(-8),
        p_device_type: "responder",
        role: "responder",
      },
    );

    if (tokenError) throw tokenError;

    await supabase.from("responder_profiles").insert({
      user_id: user.user?.id,
      active_status: "available",
      ...profile,
    });

    return token;
  }

  static async updateResponderStatus(
    token: string,
    status: ResponderProfile["activeStatus"],
  ) {
    const validation = await this.validateToken(token);
    if (!validation?.is_valid || validation.device_type !== "responder") {
      throw new Error("Invalid token or unauthorized device type");
    }

    await supabase
      .from("responder_profiles")
      .update({ active_status: status })
      .eq("user_id", validation.user_id);
  }

  static async getVictimHistory(token: string) {
    const validation = await this.validateToken(token);
    if (!validation?.is_valid || validation.device_type !== "victim") {
      throw new Error("Invalid token or unauthorized device type");
    }

    const { data, error } = await supabase
      .from("emergencies")
      .select("*")
      .eq("user_id", validation.user_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getResponderAssignments(token: string) {
    const validation = await this.validateToken(token);
    if (!validation?.is_valid || validation.device_type !== "responder") {
      throw new Error("Invalid token or unauthorized device type");
    }

    const { data, error } = await supabase
      .from("emergency_resources")
      .select(
        `
        *,
        emergency:emergency_id (*),
        resource:resource_id (*)
      `,
      )
      .eq("assigned_to", validation.user_id)
      .order("assigned_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getEmergencyDetails(
    token: string,
    emergencyId: string,
  ): Promise<EmergencyDetails> {
    const validation = await this.validateToken(token);
    if (!validation?.is_valid) throw new Error("Invalid token");

    const { data, error } = await supabase
      .from("emergencies")
      .select(
        `
        *,
        victim:user_id (*),
        resources:emergency_resources (*),
        status_changes:emergency_status_changes (*)
      `,
      )
      .eq("id", emergencyId)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateEmergencyDetails(
    token: string,
    emergencyId: string,
    details: Partial<EmergencyDetails>,
  ) {
    const validation = await this.validateToken(token);
    if (!validation?.is_valid || validation.device_type !== "responder") {
      throw new Error("Invalid token or unauthorized device type");
    }

    const { error } = await supabase
      .from("emergencies")
      .update(details)
      .eq("id", emergencyId);

    if (error) throw error;
  }

  static async getNearbyResources(
    token: string,
    location: { latitude: number; longitude: number; radius: number },
  ) {
    const validation = await this.validateToken(token);
    if (!validation?.is_valid) throw new Error("Invalid token");

    // This would typically use PostGIS for proper geospatial queries
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("status", "available");

    if (error) throw error;
    return data;
  }

  static async uploadEmergencyMedia(
    token: string,
    emergencyId: string,
    file: File,
    type: EmergencyMedia["type"],
  ) {
    const validation = await this.validateToken(token);
    if (!validation?.is_valid) throw new Error("Invalid token");

    const { data, error } = await supabase.storage
      .from("emergency-media")
      .upload(`${emergencyId}/${Date.now()}-${file.name}`, file);

    if (error) throw error;

    const { error: dbError } = await supabase.from("emergency_media").insert({
      emergency_id: emergencyId,
      type,
      url: data.path,
      uploaded_by: validation.user_id,
      metadata: {
        size: file.size,
        mimeType: file.type,
      },
    });

    if (dbError) throw dbError;
    return data.path;
  }

  static async reportHazard(token: string, hazard: Omit<HazardReport, "id">) {
    const validation = await this.validateToken(token);
    if (!validation?.is_valid) throw new Error("Invalid token");

    const { data, error } = await supabase
      .from("hazard_reports")
      .insert({
        ...hazard,
        reported_by: validation.user_id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getEmergencyMedia(token: string, emergencyId: string) {
    const validation = await this.validateToken(token);
    if (!validation?.is_valid) throw new Error("Invalid token");

    const { data, error } = await supabase
      .from("emergency_media")
      .select("*")
      .eq("emergency_id", emergencyId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  static async updateVictimStatus(
    token: string,
    emergencyId: string,
    status: {
      isConscious?: boolean;
      canMove?: boolean;
      painLevel?: number;
      symptoms?: string[];
    },
  ) {
    const validation = await this.validateToken(token);
    if (!validation?.is_valid || validation.device_type !== "victim") {
      throw new Error("Invalid token or unauthorized device type");
    }

    const { error } = await supabase.from("victim_status").upsert({
      emergency_id: emergencyId,
      user_id: validation.user_id,
      ...status,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
  }

  static async getResourceAvailability(token: string, resourceType?: string) {
    const validation = await this.validateToken(token);
    if (!validation?.is_valid) throw new Error("Invalid token");

    let query = supabase.from("resources").select("*, resource_metrics(*))");

    if (resourceType) {
      query = query.eq("type", resourceType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async requestSpecializedSupport(
    token: string,
    emergencyId: string,
    supportType: string,
    details: any,
  ) {
    const validation = await this.validateToken(token);
    if (!validation?.is_valid) throw new Error("Invalid token");

    const { data, error } = await supabase
      .from("specialized_support_requests")
      .insert({
        emergency_id: emergencyId,
        requested_by: validation.user_id,
        support_type: supportType,
        details,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
