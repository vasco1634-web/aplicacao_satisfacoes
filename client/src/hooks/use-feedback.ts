import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { InsertFeedback } from "@shared/schema";
import { z } from "zod";

// ==========================================
// PUBLIC FEEDBACK HOOKS
// ==========================================

export function useSubmitFeedback() {
  return useMutation({
    mutationFn: async (data: InsertFeedback) => {
      const validated = api.feedback.submit.input.parse(data);
      const res = await fetch(api.feedback.submit.path, {
        method: api.feedback.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) {
        throw new Error("Failed to submit feedback");
      }
      
      return api.feedback.submit.responses[201].parse(await res.json());
    },
  });
}

// ==========================================
// ADMIN HOOKS
// ==========================================

export function useAdminLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (password: string) => {
      const res = await fetch(api.admin.login.path, {
        method: api.admin.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Incorrect password");
        throw new Error("Login failed");
      }

      return api.admin.login.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate relevant queries or just let navigation handle it
    }
  });
}

type DateRangeParams = { startDate?: string; endDate?: string };

export function useFeedbackStats(params: DateRangeParams = {}) {
  return useQuery({
    queryKey: [api.admin.stats.path, params],
    queryFn: async () => {
      const url = buildUrl(api.admin.stats.path);
      const searchParams = new URLSearchParams();
      if (params.startDate) searchParams.append("startDate", params.startDate);
      if (params.endDate) searchParams.append("endDate", params.endDate);
      
      const res = await fetch(`${url}?${searchParams.toString()}`);
      
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch stats");
      
      return api.admin.stats.responses[200].parse(await res.json());
    },
    retry: false,
  });
}

export function useFeedbackHistory(page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  return useQuery({
    queryKey: [api.admin.history.path, page, limit],
    queryFn: async () => {
      const url = `${api.admin.history.path}?limit=${limit}&offset=${offset}`;
      const res = await fetch(url);
      
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch history");
      
      return api.admin.history.responses[200].parse(await res.json());
    },
    retry: false,
  });
}

export function useExportData() {
  return useMutation({
    mutationFn: async (params: { format: "csv" | "json"; startDate?: string; endDate?: string }) => {
      const searchParams = new URLSearchParams();
      searchParams.append("format", params.format);
      if (params.startDate) searchParams.append("startDate", params.startDate);
      if (params.endDate) searchParams.append("endDate", params.endDate);

      const url = `${api.admin.export.path}?${searchParams.toString()}`;
      
      // Trigger download by opening in new window/tab or creating link
      window.open(url, "_blank");
      return true;
    }
  });
}
