import { Resend } from "resend";

type ResendFailureCategory = "RESEND_TESTING_RECIPIENT_RESTRICTION" | "UNVERIFIED_SENDER_DOMAIN" | "API_KEY_PERMISSION" | "ACCOUNT_OR_QUOTA_RESTRICTION" | "RESEND_PROVIDER_REJECTION";

export class EmailDeliveryError extends Error {
  readonly category: ResendFailureCategory;
  readonly statusCode: number | null;
  readonly requestId: string | null;
  constructor(category: ResendFailureCategory, statusCode: number | null, requestId: string | null) {
    super("EMAIL_SEND_FAILED");
    this.name = "EmailDeliveryError";
    this.category = category;
    this.statusCode = statusCode;
    this.requestId = requestId;
  }
}

function domainFromEmail(value: string) {
  const match = value.match(/@([^>\s]+)>?$/);
  return match?.[1]?.toLowerCase() ?? "unknown";
}

function redactProviderMessage(value: string) {
  return value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]").slice(0, 500);
}

export function classifyResendFailure(name: string, message: string, statusCode: number | null): ResendFailureCategory {
  const text = `${name} ${message}`.toLowerCase();
  if (/onboarding|resend\.dev|testing recipient|only send to/.test(text)) return "RESEND_TESTING_RECIPIENT_RESTRICTION";
  if (/domain|sender|from address|verified/.test(text)) return "UNVERIFIED_SENDER_DOMAIN";
  if (/api key|permission|unauthorized|forbidden|invalid key/.test(text)) return "API_KEY_PERMISSION";
  if (/quota|rate limit|too many|limit exceeded|billing/.test(text)) return "ACCOUNT_OR_QUOTA_RESTRICTION";
  return statusCode === 403 ? "RESEND_PROVIDER_REJECTION" : "RESEND_PROVIDER_REJECTION";
}

function requestIdFromHeaders(headers: Record<string, string> | null | undefined) {
  if (!headers) return null;
  return headers["x-request-id"] ?? headers["X-Request-Id"] ?? headers["x-resend-request-id"] ?? null;
}

export async function sendAccountMail(input: { to: string; subject: string; html: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) throw new Error("EMAIL_PROVIDER_NOT_CONFIGURED");
  const result = await new Resend(key).emails.send({ from, to: input.to, subject: input.subject, html: input.html });
  if (result.error) {
    const statusCode = result.error.statusCode;
    const requestId = requestIdFromHeaders(result.headers);
    const category = classifyResendFailure(result.error.name, result.error.message, statusCode);
    console.error("[mail] Resend rejected account email", {
      provider: "resend",
      category,
      name: result.error.name,
      message: redactProviderMessage(result.error.message),
      statusCode,
      requestId,
      fromDomain: domainFromEmail(from),
      recipientDomain: domainFromEmail(input.to),
    });
    throw new EmailDeliveryError(category, statusCode, requestId);
  }
  return result.data;
}