import axios from "axios";
import { Twilio } from "twilio";
import sgMail from "@sendgrid/mail";

interface ExternalServiceConfig {
  name: string;
  endpoint: string;
  apiKey: string;
}

export class ExternalServicesManager {
  private static instance: ExternalServicesManager;
  private services: Map<string, ExternalServiceConfig> = new Map();
  private twilioClient: Twilio;

  private constructor() {
    // Initialize Twilio
    this.twilioClient = new Twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!,
    );

    // Initialize SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  static getInstance(): ExternalServicesManager {
    if (!ExternalServicesManager.instance) {
      ExternalServicesManager.instance = new ExternalServicesManager();
    }
    return ExternalServicesManager.instance;
  }

  async notifyEmergencyServices(emergencyData: any) {
    try {
      // Notify Police
      await this.notifyPolice(emergencyData);

      // Notify Ambulance
      await this.notifyAmbulance(emergencyData);

      // Notify Fire Department
      await this.notifyFireDepartment(emergencyData);

      return true;
    } catch (error) {
      console.error("Error notifying emergency services:", error);
      return false;
    }
  }

  private async notifyPolice(data: any) {
    const policeConfig = this.services.get("police");
    if (policeConfig) {
      await axios.post(policeConfig.endpoint, data, {
        headers: { Authorization: `Bearer ${policeConfig.apiKey}` },
      });
    }
  }

  private async notifyAmbulance(data: any) {
    const ambulanceConfig = this.services.get("ambulance");
    if (ambulanceConfig) {
      await axios.post(ambulanceConfig.endpoint, data, {
        headers: { Authorization: `Bearer ${ambulanceConfig.apiKey}` },
      });
    }
  }

  private async notifyFireDepartment(data: any) {
    const fireConfig = this.services.get("fire");
    if (fireConfig) {
      await axios.post(fireConfig.endpoint, data, {
        headers: { Authorization: `Bearer ${fireConfig.apiKey}` },
      });
    }
  }

  async sendSMS(to: string, message: string) {
    try {
      await this.twilioClient.messages.create({
        body: message,
        to,
        from: process.env.TWILIO_PHONE_NUMBER,
      });
      return true;
    } catch (error) {
      console.error("Error sending SMS:", error);
      return false;
    }
  }

  async sendEmail(to: string, subject: string, content: string) {
    try {
      await sgMail.send({
        to,
        from: process.env.SENDGRID_FROM_EMAIL!,
        subject,
        text: content,
        html: content,
      });
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }
}
