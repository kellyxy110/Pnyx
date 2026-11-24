export function publicProfilePath(username: string) {
  return `/people/${encodeURIComponent(username)}`;
}
