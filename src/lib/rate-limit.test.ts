import { afterEach, describe, expect, it, vi } from "vitest";

const { postCount, replyCount, reportCount, artifactReportCount, appealCount, recordAuditEventMock } = vi.hoisted(() => ({
  postCount: vi.fn(),
  replyCount: vi.fn(),
  reportCount: vi.fn(),
  artifactReportCount: vi.fn(),
  appealCount: vi.fn(),
  recordAuditEventMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    post: { count: postCount },
    reply: { count: replyCount },
    report: { count: reportCount },
    artifactReport: { count: artifactReportCount },
    moderationAppeal: { count: appealCount },
  },
}));
vi.mock("@/lib/audit", () => ({ recordAuditEvent: recordAuditEventMock }));

import { checkRateLimit } from "./discussion";
import { moderationRateLimit } from "./moderation";

describe("abuse rate limits", () => {
  afterEach(() => {
    postCount.mockReset();
    replyCount.mockReset();
    reportCount.mockReset();
    artifactReportCount.mockReset();
    appealCount.mockReset();
    recordAuditEventMock.mockReset();
  });

  it("allows post and reply activity below their one-minute limits", async () => {
    postCount.mockResolvedValueOnce(4);
    replyCount.mockResolvedValueOnce(19);

    await expect(checkRateLimit("user-1", "post")).resolves.toBeUndefined();
    await expect(checkRateLimit("user-1", "reply")).resolves.toBeUndefined();
  });

  it("blocks post and reply activity at their limits", async () => {
    postCount.mockResolvedValueOnce(5);
    replyCount.mockResolvedValueOnce(20);

    await expect(checkRateLimit("user-1", "post")).rejects.toThrow("RATE_LIMIT");
    await expect(checkRateLimit("user-1", "reply")).rejects.toThrow("RATE_LIMIT");
  });

  it("blocks report bursts and records an audit event", async () => {
    reportCount.mockResolvedValueOnce(3);
    artifactReportCount.mockResolvedValueOnce(2);
    recordAuditEventMock.mockResolvedValueOnce({ id: "audit-1" });

    await expect(moderationRateLimit("user-1", "report")).rejects.toThrow("RATE_LIMIT");
    expect(recordAuditEventMock).toHaveBeenCalledWith({
      actorId: "user-1",
      action: "RATE_LIMIT_BLOCKED",
      entityType: "REPORT",
      metadata: { windowSeconds: 60 },
    });
  });

  it("blocks appeal bursts and records an audit event", async () => {
    appealCount.mockResolvedValueOnce(2);
    recordAuditEventMock.mockResolvedValueOnce({ id: "audit-2" });

    await expect(moderationRateLimit("user-1", "appeal")).rejects.toThrow("RATE_LIMIT");
    expect(recordAuditEventMock).toHaveBeenCalledWith(expect.objectContaining({ entityType: "APPEAL" }));
  });
});