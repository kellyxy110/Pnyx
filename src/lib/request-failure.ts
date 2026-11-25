export function requestFailureMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message && error.message !== "Failed to fetch" ? error.message : fallback;
}
