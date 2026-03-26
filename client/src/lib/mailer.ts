/**
 * Envoi d’emails (SMTP optionnel) — même logique que server/lib/mailer.js.
 */
import nodemailer from "nodemailer";

function getTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
}

export async function sendMail({ to, subject, text }: { to: string; subject: string; text: string }): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    console.warn("[mailer] SMTP non configuré — email ignoré:", subject, "→", to);
    return;
  }
  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text
  });
}
