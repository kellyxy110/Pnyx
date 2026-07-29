import { z } from "zod";

export const registrationSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  username: z.string().trim().min(3).max(30).regex(/^[a-z0-9_-]+$/, "Use lowercase letters, numbers, hyphens, and underscores."),
  displayName: z.string().trim().min(2).max(80),
  password: z.string().min(12).max(128),
});

export const profileSchema = z.object({
  username: z.string().trim().toLowerCase().min(3).max(30).regex(/^[a-z0-9_-]+$/, "Use 3–30 lowercase letters, numbers, hyphens, or underscores.").optional(),
  displayName: z.string().trim().min(2).max(80),
  headline: z.string().trim().max(120).nullable(),
  location: z.string().trim().max(100).nullable(),
  websiteUrl: z.string().url().nullable(),
  githubUrl: z.string().url().nullable(),
  linkedinUrl: z.string().url().nullable(),
  avatarUrl: z.string().url().nullable(),
  bio: z.string().trim().max(500).nullable(),
  timezone: z.string().trim().max(80).nullable(),
  expertise: z.array(z.string().trim().min(1).max(40)).max(20),
  skills: z.array(z.string().trim().min(1).max(40)).max(30),
  interests: z.array(z.string().trim().min(1).max(40)).max(20),
  links: z.array(z.string().url()).max(8),
  profileVisibility: z.enum(["PUBLIC", "FOLLOWERS_ONLY", "PRIVATE"]),
});

export const spaceSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().min(20).max(500),
  rules: z.string().trim().max(3000).nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(20).default([]),
});
