export function isEmailSignupEnabled() {
  return process.env.EMAIL_SIGNUP_ENABLED === "true";
}

