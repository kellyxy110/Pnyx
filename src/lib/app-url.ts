export function configuredAppUrl(value = process.env.APP_URL) {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (!(url.protocol === "https:" || url.protocol === "http:") || url.username || url.password || url.search || url.hash) return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function accountActionUrl(path: string, value = process.env.APP_URL) {
  const base = configuredAppUrl(value);
  if (!base) return null;
  return `${base}/${path.replace(/^\//, "")}`;
}
