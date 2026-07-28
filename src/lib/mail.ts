import { Resend } from "resend";

export async function sendAccountMail(input: { to: string; subject: string; html: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) throw new Error("EMAIL_PROVIDER_NOT_CONFIGURED");
  const result = await new Resend(key).emails.send({ from, to: input.to, subject: input.subject, html: input.html });
  if (result.error) {
    console.error("[mail] Resend rejected the account email", { name: result.error.name });
    throw new Error("EMAIL_SEND_FAILED");
  }
  return result.data;
}