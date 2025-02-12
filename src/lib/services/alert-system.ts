import { supabase } from "../supabase";
import { ExternalServicesManager } from "./external-services";

export class AlertSystem {
  private static instance: AlertSystem;
  private externalServices: ExternalServicesManager;

  private constructor() {
    this.externalServices = ExternalServicesManager.getInstance();
  }

  static getInstance(): AlertSystem {
    if (!AlertSystem.instance) {
      AlertSystem.instance = new AlertSystem();
    }
    return AlertSystem.instance;
  }

  async broadcastEmergencyAlert(emergency: any) {
    try {
      // Create alert in the system
      const { data: alert } = await supabase
        .from("alerts")
        .insert({
          emergency_id: emergency.id,
          type: "emergency",
          severity: emergency.severity,
          message: `New emergency: ${emergency.type} at ${emergency.location}`,
          status: "active",
        })
        .select()
        .single();

      // Notify all relevant parties
      await this.notifyRelevantParties(alert);

      // Trigger external notifications
      await this.triggerExternalNotifications(emergency);

      return { success: true, alert };
    } catch (error) {
      console.error("Error broadcasting alert:", error);
      return { success: false, error };
    }
  }

  private async notifyRelevantParties(alert: any) {
    try {
      // Get all relevant responders
      const { data: responders } = await supabase
        .from("responders")
        .select("id, user_id, phone, notification_preferences")
        .eq("status", "available");

      if (!responders) return;

      // Send notifications to each responder
      for (const responder of responders) {
        // Send in-app notification
        await supabase.from("notifications").insert({
          user_id: responder.user_id,
          type: "emergency",
          message: alert.message,
          alert_id: alert.id,
        });

        // Send SMS if enabled in preferences
        if (responder.notification_preferences?.sms) {
          await this.externalServices.sendSMS(responder.phone, alert.message);
        }

        // Send email if enabled in preferences
        if (responder.notification_preferences?.email) {
          await this.externalServices.sendEmail(
            responder.email,
            "Emergency Alert",
            alert.message,
          );
        }
      }
    } catch (error) {
      console.error("Error notifying parties:", error);
    }
  }

  private async triggerExternalNotifications(emergency: any) {
    // Notify external emergency services
    await this.externalServices.notifyEmergencyServices(emergency);
  }

  async updateAlertStatus(alertId: string, status: string) {
    try {
      const { data: alert } = await supabase
        .from("alerts")
        .update({ status })
        .eq("id", alertId)
        .select()
        .single();

      if (status === "resolved") {
        await this.sendResolutionNotifications(alert);
      }

      return { success: true, alert };
    } catch (error) {
      console.error("Error updating alert status:", error);
      return { success: false, error };
    }
  }

  private async sendResolutionNotifications(alert: any) {
    // Notify all involved parties about the resolution
    const { data: notifications } = await supabase
      .from("notifications")
      .select("user_id")
      .eq("alert_id", alert.id);

    if (!notifications) return;

    // Send resolution notifications
    for (const notification of notifications) {
      await supabase.from("notifications").insert({
        user_id: notification.user_id,
        type: "resolution",
        message: `Alert resolved: ${alert.message}`,
        alert_id: alert.id,
      });
    }
  }
}
