import nodemailer from "nodemailer";

const fromEmail = process.env.BREVO_FROM_EMAIL || "no-reply@mapoly.edu.ng";
const fromName = process.env.BREVO_FROM_NAME || "APTPA";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function isEmailConfigured(): boolean {
  return !!(process.env.BREVO_SMTP_HOST && process.env.BREVO_SMTP_LOGIN && process.env.BREVO_SMTP_KEY);
}

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
  url?: string;
}

export async function sendEmail(payload: EmailPayload) {
  if (!isEmailConfigured()) {
    console.warn("Brevo SMTP not configured — set BREVO_SMTP_* env vars");
    return;
  }

  const port = Number(process.env.BREVO_SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
    port,
    secure: port === 465,
    auth: {
      user: process.env.BREVO_SMTP_LOGIN || "",
      pass: process.env.BREVO_SMTP_KEY || "",
    },
  });

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: payload.to,
    subject: payload.subject,
    text: `${payload.text}${payload.url ? `\n\nOpen: ${appUrl}${payload.url}` : ""}`,
    html:
      payload.html ||
      `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
        <p style="color:#374151;line-height:1.6;">${payload.text.replace(/\n/g, "<br/>")}</p>
      </div>`,
  });
}
