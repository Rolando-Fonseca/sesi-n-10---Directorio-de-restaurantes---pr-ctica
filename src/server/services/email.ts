import nodemailer from "nodemailer";
import { DomainError } from "./errors";

export type OutgoingEmail = { to: string; subject: string; html: string; text?: string };

/** Configuración SMTP desde el entorno; null si no está completa. */
export function smtpConfig() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_PORT || 465);
  return { host, port, secure: port === 465, auth: { user, pass }, from: process.env.EMAIL_FROM || user };
}

/**
 * Envía un correo por SMTP (Gmail con contraseña de aplicación en la demo).
 * Lo usa el relevo /api/v1/admin/email para n8n; la app no envía correo por
 * sí misma (ADR-0003 del P4: los correos los decide el P5).
 */
export async function sendEmail(email: OutgoingEmail, transportFactory = nodemailer.createTransport) {
  const cfg = smtpConfig();
  if (!cfg) throw new DomainError("FORBIDDEN", "El envío de correo no está configurado (SMTP_HOST, SMTP_USER, SMTP_PASSWORD)");
  const transport = transportFactory({ host: cfg.host, port: cfg.port, secure: cfg.secure, auth: cfg.auth, connectionTimeout: 15_000, socketTimeout: 20_000 });
  const info = await transport.sendMail({ from: cfg.from, to: email.to, subject: email.subject, html: email.html, text: email.text });
  return { messageId: info.messageId ?? null, accepted: (info.accepted ?? []).map(String), response: String(info.response ?? "") };
}
