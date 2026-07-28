import { describe, expect, it } from "vitest";
import { registrationSchema, spaceSchema } from "./account-validation";

describe("identity boundary validation", () => {
  it("requires strong passwords and safe usernames", () => {
    expect(registrationSchema.safeParse({ email: "person@example.com", username: "person_1", displayName: "Person", password: "long-enough-password" }).success).toBe(true);
    expect(registrationSchema.safeParse({ email: "person@example.com", username: "Person!", displayName: "Person", password: "short" }).success).toBe(false);
  });

  it("requires a meaningful Space description", () => {
    expect(spaceSchema.safeParse({ name: "Web", slug: "web", description: "A community for building thoughtful web products." }).success).toBe(true);
    expect(spaceSchema.safeParse({ name: "Web", slug: "web", description: "Too short" }).success).toBe(false);
  });
});
