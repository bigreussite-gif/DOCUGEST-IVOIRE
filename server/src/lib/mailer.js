const nodemailer = require("nodemailer");

function isSmtpConfigured() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  return Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS);
}

async function sendMail({ to, subject, text }) {
  if (!isSmtpConfigured()) {
    return;
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text
  });
}

module.exports = { sendMail };

