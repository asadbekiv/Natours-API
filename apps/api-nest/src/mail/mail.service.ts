import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.from = `Natours <${this.config.get<string>('EMAIL_FROM') ?? 'no-reply@natours.io'}>`;
  }

  private transport(): Transporter {
    if (this.config.get<string>('NODE_ENV') === 'production') {
      // Provider-neutral SMTP (Brevo, Resend, SendGrid, ...).
      return nodemailer.createTransport({
        host: this.config.get<string>('SMTP_HOST'),
        port: Number(this.config.get<string>('SMTP_PORT')) || 587,
        auth: {
          user: this.config.get<string>('SMTP_USER'),
          pass: this.config.get<string>('SMTP_PASS'),
        },
      });
    }
    return nodemailer.createTransport({
      host: this.config.get<string>('EMAIL_HOST'),
      port: Number(this.config.get<string>('EMAIL_PORT')) || 2525,
      secure: false,
      auth: {
        user: this.config.get<string>('EMAIL_USERNAME'),
        pass: this.config.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  // Lets callers decide what to do on failure (signup swallows; forgot rolls back).
  private async send(to: string, subject: string, html: string): Promise<void> {
    await this.transport().sendMail({
      from: this.from,
      to,
      subject,
      html,
      text: stripHtml(html),
    });
  }

  async sendWelcome(to: string, name: string, url: string): Promise<void> {
    await this.send(
      to,
      'Welcome to the Natours Family!',
      welcomeTemplate(firstNameOf(name), url),
    );
  }

  async sendPasswordReset(to: string, name: string, url: string): Promise<void> {
    await this.send(
      to,
      'Your password reset token (valid for 10 minutes)',
      passwordResetTemplate(firstNameOf(name), url),
    );
  }
}

// --- helpers ---

function firstNameOf(name: string): string {
  return name.split(' ')[0] ?? name;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function button(url: string, label: string): string {
  return `<a href="${url}" style="display:inline-block;padding:12px 22px;background:#55c57a;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">${label}</a>`;
}

function welcomeTemplate(firstName: string, url: string): string {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#333;line-height:1.6;max-width:560px;margin:0 auto;">
      <h1 style="color:#28b487;">Welcome to Natours, ${firstName}!</h1>
      <p>We're thrilled to have you. Natours is the best way to discover and book unforgettable nature tours.</p>
      <p>${button(url, 'Get started')}</p>
      <p>If you need anything, just reply to this email.</p>
      <p>— The Natours Team</p>
    </div>`;
}

function passwordResetTemplate(firstName: string, url: string): string {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#333;line-height:1.6;max-width:560px;margin:0 auto;">
      <h1 style="color:#28b487;">Hi ${firstName},</h1>
      <p>You requested a password reset. Click the button below to set a new password. This link is valid for 10 minutes.</p>
      <p>${button(url, 'Reset your password')}</p>
      <p>If you didn't request this, please ignore this email — your password stays the same.</p>
      <p>— The Natours Team</p>
    </div>`;
}
