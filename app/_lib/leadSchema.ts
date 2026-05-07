import { z } from "zod";

// Source of truth for the /api/lead JSON contract. The form in
// app/[locale]/_components/BriefBox/EndCard.tsx must POST a body whose keys
// exactly match this schema. Honeypot field name is `company_phone`. The
// hidden `demoPayload` is the JSON returned by /api/brief.

export const briefRecommendationSchema = z.object({
  headline: z.string().min(1).max(200),
  ask: z.string().min(1).max(500)
});

export const briefAgentSchema = z.object({
  name: z.string().min(1).max(80),
  color: z.string().min(1).max(20),
  tools: z.array(z.string().min(1).max(40)).min(1).max(8)
});

export const briefLogSchema = z.object({
  agent: z.string().min(1).max(80),
  action: z.string().min(1).max(200),
  ts: z.string().min(1).max(20)
});

export const demoPayloadSchema = z.object({
  agents: z.array(briefAgentSchema).min(1).max(6),
  // Keep this aligned with briefResponseSchema.logs.max() in briefSchema.ts.
  // The brief route can return up to 12 activity items now.
  logs: z.array(briefLogSchema).min(1).max(12),
  recommendation: briefRecommendationSchema
});

export const leadInputSchema = z.object({
  // Visible required
  name: z.string().trim().min(1, "navn er påkrevd").max(120),
  email: z.string().trim().toLowerCase().email("ugyldig e-post").max(200),
  company: z.string().trim().min(1, "firmanavn er påkrevd").max(200),
  website: z
    .string()
    .trim()
    .url("nettside må være en gyldig URL")
    .max(500)
    .refine((u) => /^https?:\/\//i.test(u), "nettside må starte med http(s)://"),

  // Visible optional
  notes: z.string().trim().max(2000).optional().default(""),

  // Hidden — populated by the form from demo state
  brief: z.string().trim().min(1).max(500),
  demoPayload: demoPayloadSchema,
  language: z.enum(["no", "en"]),
  source: z.literal("brief-box-v1"),

  // Honeypot. Empty on legit submits; bots fill it.
  company_phone: z.string().max(200).optional().default("")
});

export type LeadInput = z.infer<typeof leadInputSchema>;
export type DemoPayload = z.infer<typeof demoPayloadSchema>;
