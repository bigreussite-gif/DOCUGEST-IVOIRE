const nodemailer = require("nodemailer");

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

/**
 * En prod (Vercel + Insforge uniquement), SMTP est optionnel : les comptes fonctionnent sans email sortant.
 */
async function sendMail({ to, subject, text }) {
  const transport = getTransport();
  if (!transport) {
    console.warn("[mail] SMTP non configuré — email ignoré:", subject, "→", to);
    return;
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text
  });
}

module.exports = { sendMail };
