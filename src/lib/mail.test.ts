import { afterEach, describe, expect, it, vi } from "vitest";

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));
vi.mock("resend", () => ({ Resend: vi.fn(() => ({ emails: { send: sendMock } })) }));

import { classifyResendFailure, sendAccountMail } from "./mail";

describe("Resend delivery handling", () => {
  afterEach(() => { sendMock.mockReset(); vi.restoreAllMocks(); });

  it("classifies resend.dev recipient restrictions", () => {
    expect(classifyResendFailure("restricted_to_testing", "You can only send to your own email with onboarding@resend.dev", 403)).toBe("RESEND_TESTING_RECIPIENT_RESTRICTION");
  });

  it("records safe diagnostics for a 403 without logging credentials", async () => {
    process.env.RESEND_API_KEY = "secret-test-key";
    process.env.EMAIL_FROM = "Pnyx <noreply@mail.pnyx-psi.vercel.app>";
    sendMock.mockResolvedValue({ error: { name: "validation_error", message: "The sender domain is not verified", statusCode: 403 }, data: null, headers: { "x-request-id": "req_test_403" } });
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await expect(sendAccountMail({ to: "person@example.com", subject: "Test", html: "<p>Test</p>" })).rejects.toMatchObject({ category: "UNVERIFIED_SENDER_DOMAIN", statusCode: 403, requestId: "req_test_403" });
    const entry = JSON.stringify(log.mock.calls[0]);
    expect(entry).toContain("req_test_403");
    expect(entry).toContain("mail.pnyx-psi.vercel.app");
    expect(entry).not.toContain("secret-test-key");
    expect(entry).not.toContain("person@example.com");
  });
});