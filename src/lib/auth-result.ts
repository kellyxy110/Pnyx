export type SignInResultLike = { ok?: boolean; error?: string } | undefined;

export function credentialsSignInSucceeded(result: SignInResultLike) {
  return result?.ok === true && !result.error;
}

export function safeReturnTo(value: string | null | undefined, fallback = "/profile") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
