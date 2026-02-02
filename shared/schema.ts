
import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  rating: text("rating").notNull(), // 'very_satisfied', 'satisfied', 'unsatisfied'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({ 
  id: true, 
  createdAt: true 
});

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export type FeedbackStats = {
  total: number;
  breakdown: Record<string, number>;
  percentages: Record<string, number>;
};

export type DateFilter = {
  startDate?: string;
  endDate?: string;
};
