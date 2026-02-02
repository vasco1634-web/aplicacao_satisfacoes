
import { db } from "./db";
import { feedback, type Feedback, type InsertFeedback, type FeedbackStats, type DateFilter } from "@shared/schema";
import { count, eq, and, gte, lte, desc, sql } from "drizzle-orm";

export interface IStorage {
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbackStats(filter?: DateFilter): Promise<FeedbackStats>;
  getFeedbackHistory(limit?: number, offset?: number): Promise<{ data: Feedback[], total: number }>;
  getAllFeedbackForExport(filter?: DateFilter): Promise<Feedback[]>;
  verifyAdminPassword(password: string): boolean;
}

export class DatabaseStorage implements IStorage {
  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db
      .insert(feedback)
      .values(insertFeedback)
      .returning();
    return newFeedback;
  }

  async getFeedbackStats(filter?: DateFilter): Promise<FeedbackStats> {
    // Build where clause based on filter
    const conditions = [];
    if (filter?.startDate) {
      conditions.push(gte(feedback.createdAt, new Date(filter.startDate)));
    }
    if (filter?.endDate) {
      const endDate = new Date(filter.endDate);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(lte(feedback.createdAt, endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get counts grouped by rating
    const counts = await db
      .select({
        rating: feedback.rating,
        count: count(feedback.id),
      })
      .from(feedback)
      .where(whereClause)
      .groupBy(feedback.rating);

    const total = counts.reduce((sum, item) => sum + item.count, 0);
    
    const breakdown: Record<string, number> = {
      very_satisfied: 0,
      satisfied: 0,
      unsatisfied: 0,
    };
    
    counts.forEach(item => {
      breakdown[item.rating] = item.count;
    });

    const percentages: Record<string, number> = {};
    Object.keys(breakdown).forEach(key => {
      percentages[key] = total > 0 ? Math.round((breakdown[key] / total) * 100) : 0;
    });

    return {
      total,
      breakdown,
      percentages,
    };
  }

  async getFeedbackHistory(limit: number = 50, offset: number = 0): Promise<{ data: Feedback[], total: number }> {
    const [totalResult] = await db.select({ count: count() }).from(feedback);
    const total = totalResult.count;

    const data = await db
      .select()
      .from(feedback)
      .orderBy(desc(feedback.createdAt))
      .limit(limit)
      .offset(offset);

    return { data, total };
  }

  async getAllFeedbackForExport(filter?: DateFilter): Promise<Feedback[]> {
     const conditions = [];
    if (filter?.startDate) {
      conditions.push(gte(feedback.createdAt, new Date(filter.startDate)));
    }
    if (filter?.endDate) {
      const endDate = new Date(filter.endDate);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(lte(feedback.createdAt, endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return await db
      .select()
      .from(feedback)
      .where(whereClause)
      .orderBy(desc(feedback.createdAt));
  }

  verifyAdminPassword(password: string): boolean {
    // Simple hardcoded password as requested "password simple"
    // In a real app, this should be in env vars or hashed in DB
    return password === "admin123";
  }
}

export const storage = new DatabaseStorage();
