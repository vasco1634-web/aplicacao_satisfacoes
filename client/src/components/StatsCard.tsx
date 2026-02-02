import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  loading?: boolean;
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendUp, 
  className,
  loading = false
}: StatsCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300",
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-slate-100 animate-pulse rounded" />
          ) : (
            <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl bg-slate-50 text-slate-600",
          loading && "animate-pulse"
        )}>
          {icon}
        </div>
      </div>
      
      {trend && !loading && (
        <div className="mt-4 flex items-center text-sm">
          <span className={cn(
            "font-medium mr-2 px-2 py-0.5 rounded-full text-xs",
            trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {trend}
          </span>
          <span className="text-slate-400">vs período anterior</span>
        </div>
      )}
    </div>
  );
}
