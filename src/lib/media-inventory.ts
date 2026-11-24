/** Snapshot classification only. A candidate is never authorization to delete. */
export function classifyMediaInventory(objects: { key: string; lastModified?: Date }[], referenced: Set<string>, receipts: Set<string>, now = new Date()) {
  const cutoff = now.getTime() - 7 * 24 * 60 * 60_000;
  return objects.map(object => {
    let status: "referenced" | "tracked" | "recent" | "review" | "unknown";
    if (referenced.has(object.key)) status = "referenced";
    else if (receipts.has(object.key)) status = "tracked";
    else if (!/^users\/[a-zA-Z0-9_-]+\/(avatar|banner)\/[a-zA-Z0-9_-]+\.webp$/.test(object.key) || !object.lastModified || !Number.isFinite(object.lastModified.getTime())) status = "unknown";
    else status = object.lastModified.getTime() > cutoff ? "recent" : "review";
    return { key: object.key, status };
  });
}
