import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { supabase } from "../supabase";

export class BackupService {
  private static instance: BackupService;
  private s3Client: S3Client;

  private constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  async createBackup() {
    try {
      // Get all tables data
      const tables = [
        "emergencies",
        "emergency_logs",
        "emergency_messages",
        "emergency_resources",
        "emergency_status_changes",
        "responders",
        "resources",
      ];

      const backupData: { [key: string]: any } = {};

      for (const table of tables) {
        const { data } = await supabase.from(table).select("*");
        backupData[table] = data;
      }

      // Create backup file
      const timestamp = new Date().toISOString();
      const backupFileName = `backup-${timestamp}.json`;
      const backupContent = JSON.stringify(backupData, null, 2);

      // Upload to S3
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BACKUP_BUCKET!,
          Key: backupFileName,
          Body: backupContent,
          ContentType: "application/json",
        }),
      );

      // Log backup creation
      await supabase.from("backup_logs").insert({
        filename: backupFileName,
        status: "success",
        size_bytes: backupContent.length,
      });

      return {
        success: true,
        filename: backupFileName,
      };
    } catch (error) {
      console.error("Backup creation failed:", error);

      // Log backup failure
      await supabase.from("backup_logs").insert({
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async scheduleBackups() {
    const schedule = require("node-schedule");

    // Schedule daily backups at 3 AM
    schedule.scheduleJob("0 3 * * *", async () => {
      await this.createBackup();
    });

    // Schedule weekly full backups on Sunday at 4 AM
    schedule.scheduleJob("0 4 * * 0", async () => {
      await this.createFullBackup();
    });
  }

  private async createFullBackup() {
    // Implement full backup logic here
    // This could include additional data, configurations, etc.
  }
}
