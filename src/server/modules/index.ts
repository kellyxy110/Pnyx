export const domainModules = ["identity", "profiles", "spaces", "content", "knowledge", "search", "ai", "moderation", "notifications", "analytics"] as const;
export type DomainModule = (typeof domainModules)[number];
