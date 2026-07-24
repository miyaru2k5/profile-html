import { z } from "zod";

export const createProfileSchema = z.object({
  tenantId: z.string().min(1),
  ownerId: z.string().min(1),
  slug: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, "Slug phải là chuỗi URL hợp lệ"),
  displayName: z.string().min(1).max(120),
  handle: z.string().max(120).optional().nullable(),
  headline: z.string().max(200).optional().nullable(),
  bio: z.string().max(5000).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable().or(z.literal("")),
  bannerUrl: z.string().url().optional().nullable().or(z.literal("")),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: z.string().max(40).optional().nullable(),
  location: z.string().max(120).optional().nullable(),
  locale: z.string().min(2).max(10).optional(),
  themeId: z.string().optional().nullable(),
  templateId: z.string().optional().nullable(),
  seoTitle: z.string().max(180).optional().nullable(),
  seoDescription: z.string().max(320).optional().nullable(),
  seoKeywords: z.string().max(500).optional().nullable(),
  ogImageUrl: z.string().url().optional().nullable().or(z.literal("")),
  twitterHandle: z.string().max(80).optional().nullable(),
});

export const updateProfileSchema = createProfileSchema
  .omit({ tenantId: true, ownerId: true, slug: true })
  .partial()
  .extend({
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "SUSPENDED"]).optional(),
    settings: z.record(z.string(), z.unknown()).optional(),
  });

export type CreateProfileDto = z.infer<typeof createProfileSchema>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
