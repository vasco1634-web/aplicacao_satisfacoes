import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Calendar, ChevronDown } from "lucide-react";
import { subDays, startOfDay, format } from "date-fns";

type FilterType = "today" | "week" | "all";

interface DateRangeFilterProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType, startDate?: string, endDate?: string) => void;
}

export function DateRangeFilter({ activeFilter, onFilterChange }: DateRangeFilterProps) {
  const handleSelect = (filter: FilterType) => {
    let startDate: string | undefined;
    let endDate: string | undefined;
    
    const now = new Date();
    
    if (filter === "today") {
      startDate = startOfDay(now).toISOString();
    } else if (filter === "week") {
      startDate = subDays(now, 7).toISOString();
    }
    
    onFilterChange(filter, startDate, endDate);
  };

  const labels = {
    today: "Hoje",
    week: "Últimos 7 dias",
    all: "Todo o período"
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 border-slate-200">
          <Calendar className="h-4 w-4 text-slate-500" />
          <span className="font-medium text-slate-700">{labels[activeFilter]}</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleSelect("today")}>
          Hoje
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect("week")}>
          Últimos 7 dias
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect("all")}>
          Todo o período
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
