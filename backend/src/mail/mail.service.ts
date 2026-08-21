import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private getTransporter() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return null;
    }

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendTaskCreated(email: string, title: string) {
    return this.send(email, 'Task created', `Your task "${title}" was created successfully.`);
  }

  async sendTaskDone(email: string, title: string) {
    return this.send(email, 'Task completed', `Your task "${title}" has been marked as done.`);
  }

  private async send(to: string, subject: string, text: string) {
    const transporter = this.getTransporter();

    if (!transporter) {
      this.logger.warn('SMTP is not configured. Email skipped.');
      return;
    }

    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to,
        subject,
        text,
      });
    } catch (error) {
      this.logger.error('Email could not be sent', error);
    }
  }
}
