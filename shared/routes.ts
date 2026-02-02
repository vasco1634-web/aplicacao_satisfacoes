
import { z } from "zod";
import { insertFeedbackSchema, feedback } from "./schema";

export const errorSchemas = {
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  feedback: {
    submit: {
      method: "POST" as const,
      path: "/api/feedback",
      input: insertFeedbackSchema,
      responses: {
        201: z.custom<typeof feedback.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
  },
  admin: {
    login: {
      method: "POST" as const,
      path: "/api/admin/login",
      input: z.object({ password: z.string() }),
      responses: {
        200: z.object({ success: z.boolean() }),
        401: errorSchemas.unauthorized,
      },
    },
    stats: {
      method: "GET" as const,
      path: "/api/admin/stats",
      input: z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional(),
      responses: {
        200: z.object({
          total: z.number(),
          breakdown: z.record(z.number()),
          percentages: z.record(z.number()),
          dailyTrend: z.array(z.object({
            date: z.string(),
            count: z.number(),
            rating: z.string(),
          })),
        }),
        401: errorSchemas.unauthorized,
      },
    },
    history: {
      method: "GET" as const,
      path: "/api/admin/history",
      input: z.object({
        limit: z.coerce.number().optional(),
        offset: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.object({
          data: z.array(z.custom<typeof feedback.$inferSelect>()),
          total: z.number(),
        }),
        401: errorSchemas.unauthorized,
      },
    },
    export: {
      method: "GET" as const,
      path: "/api/admin/export",
      input: z.object({
        format: z.enum(["csv", "json"]).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional(),
      responses: {
        200: z.any(), // File download
        401: errorSchemas.unauthorized,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
