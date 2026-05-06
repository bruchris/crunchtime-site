import { z } from "zod";

export const AGENT_COLORS = ["lime", "blue", "amber", "violet", "cyan"] as const;
export type AgentColor = (typeof AGENT_COLORS)[number];

export const agentSchema = z.object({
  name: z.string().min(1).max(40),
  color: z.enum(AGENT_COLORS),
  tools: z.array(z.string().min(1).max(30)).min(1).max(4)
});

export const ACTIVITY_TYPES = ["assignment", "automation", "issue"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const logSchema = z.object({
  agent: z.string().min(1).max(40),
  action: z.string().min(1).max(160),
  ts: z.string().regex(/^\d{2}:\d{2}$/),
  type: z.enum(ACTIVITY_TYPES).optional(),
  tokens: z.number().int().min(0).max(99999).optional()
});

export const recommendationSchema = z.object({
  headline: z.string().min(1).max(80),
  ask: z.string().min(1).max(200)
});

export const briefResponseSchema = z.object({
  agents: z.array(agentSchema).min(1).max(4),
  logs: z.array(logSchema).min(3).max(12),
  recommendation: recommendationSchema
});

export type BriefResponse = z.infer<typeof briefResponseSchema>;
export type Agent = z.infer<typeof agentSchema>;
export type LogLine = z.infer<typeof logSchema>;

export const briefRequestSchema = z.object({
  brief: z.string().min(1).max(500),
  lang: z.enum(["no", "en"])
});

export type BriefRequest = z.infer<typeof briefRequestSchema>;
export type Lang = z.infer<typeof briefRequestSchema>["lang"];
export type Recommendation = z.infer<typeof recommendationSchema>;
