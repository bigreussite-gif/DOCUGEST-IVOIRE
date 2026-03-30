/**
 * Envoi d'emails — Resend (prioritaire) ou SMTP fallback.
 * Variables d'environnement :
 *   RESEND_API_KEY  — clé API Resend (https://resend.com)
 *   RESEND_FROM     — ex: "DocuGestIvoire <noreply@docugestivoire.ci>"
 *   SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS  — fallback SMTP
 */
import nodemailer from "nodemailer";

/* ── Template HTML ── */
function wrapHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
  <tr><td align="center">
    <table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.07)">
      <tr><td style="background:#1a6b4a;padding:24px 32px;text-align:center">
        <img src="https://docugest-ivoire.vercel.app/logo-docugest-ivoire.png" alt="DocuGestIvoire" height="48" style="display:block;margin:0 auto"/>
      </td></tr>
      <tr><td style="padding:32px">${bodyHtml}</td></tr>
      <tr><td style="background:#f1f5f9;padding:16px 32px;text-align:center;font-size:11px;color:#94a3b8">
        &copy; ${new Date().getFullYear()} DocuGestIvoire — Cote d'Ivoire<br/>
        <a href="https://docugest-ivoire.vercel.app" style="color:#1a6b4a">docugest-ivoire.vercel.app</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

/* ── Resend ── */
async function sendViaResend(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY manquant");
  const from = process.env.RESEND_FROM ?? "DocuGestIvoire <noreply@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html, text: opts.text }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${err}`);
  }
}

/* ── SMTP fallback ── */
function getSmtpTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

/* ── Interface publique ── */
export async function sendMail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  const finalHtml =
    html ??
    wrapHtml(
      subject,
      `<p style="color:#334155;font-size:15px;line-height:1.6">${text.replace(/\n/g, "<br/>")}</p>`
    );

  if (process.env.RESEND_API_KEY) {
    try {
      await sendViaResend({ to, subject, html: finalHtml, text });
      return;
    } catch (e) {
      console.error("[mailer] Resend echec, bascule SMTP:", e);
    }
  }

  const transport = getSmtpTransport();
  if (transport) {
    await transport.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to,
      subject,
      text,
      html: finalHtml,
    });
    return;
  }

  console.warn(
    "[mailer] Aucun provider configure (RESEND_API_KEY ou SMTP_*) — email ignore:",
    subject,
    "->",
    to
  );
}
