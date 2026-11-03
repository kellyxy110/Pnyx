import { describe, expect, it } from "vitest";
import { profileSchema, registrationSchema, spaceSchema } from "./account-validation";

describe("identity boundary validation", () => {
  it("requires strong passwords and safe usernames", () => {
    expect(registrationSchema.safeParse({ email: "person@example.com", username: "person_1", displayName: "Person", password: "long-enough-password" }).success).toBe(true);
    expect(registrationSchema.safeParse({ email: "person@example.com", username: "Person!", displayName: "Person", password: "short" }).success).toBe(false);
  });

  it("requires a meaningful Space description", () => {
    expect(spaceSchema.safeParse({ name: "Web", slug: "web", description: "A community for building thoughtful web products." }).success).toBe(true);
    expect(spaceSchema.safeParse({ name: "Web", slug: "web", description: "Too short" }).success).toBe(false);
  });

  it("validates profile identity and social links", () => {
    const valid = { displayName: "Pnyx Builder", headline: "Open-source engineer", location: "Lagos", websiteUrl: "https://pnyx.org", githubUrl: "https://github.com/pnyx", linkedinUrl: "https://www.linkedin.com/in/pnyx", avatarUrl: null, bio: "Building useful things.", timezone: "Africa/Lagos", expertise: ["TypeScript"], skills: ["React"], interests: ["Open source"], links: ["https://example.com"], profileVisibility: "PUBLIC" };
    expect(profileSchema.safeParse(valid).success).toBe(true);
    expect(profileSchema.safeParse({ ...valid, githubUrl: "not-a-url" }).success).toBe(false);
  });
});
describe("profile link and media ownership boundaries", () => {
  const profile = { displayName: "Profile Fixture", headline: null, location: null, websiteUrl: null, githubUrl: null, linkedinUrl: null, bio: null, timezone: null, expertise: [], skills: [], interests: [], links: [], profileVisibility: "PUBLIC" };
  it.each(["javascript:alert(1)", "data:text/html,unsafe", "file:///etc/passwd", "https://user:password@example.test"])("rejects unsafe profile link %s", link => {
    expect(profileSchema.safeParse({ ...profile, websiteUrl: link }).success).toBe(false);
    expect(profileSchema.safeParse({ ...profile, links: [link] }).success).toBe(false);
  });
  it("ignores client avatar pointers during ordinary profile edits", () => {
    expect(profileSchema.parse({ ...profile, avatarUrl: "https://unrelated.example.test/new.webp" })).not.toHaveProperty("avatarUrl");
  });
});
