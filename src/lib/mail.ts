import { Resend } from "resend";

export async function sendAccountMail(input: { to: string; subject: string; html: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) throw new Error("EMAIL_PROVIDER_NOT_CONFIGURED");
  return new Resend(key).emails.send({ from, to: input.to, subject: input.subject, html: input.html });
}
