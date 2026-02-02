import { useState } from "react";
import { useFeedbackStats, useFeedbackHistory, useExportData } from "@/hooks/use-feedback";
import { StatsCard } from "@/components/StatsCard";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { 
  Smile, 
  Meh, 
  Frown, 
  Download, 
  LogOut, 
  TrendingUp,
  MessageSquare
} from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

const COLORS = {
  very_satisfied: '#22c55e', // green-500
  satisfied: '#eab308',      // yellow-500
  unsatisfied: '#ef4444',    // red-500
};

const LABELS: Record<string, string> = {
  very_satisfied: 'Muito Satisfeito',
  satisfied: 'Satisfeito',
  unsatisfied: 'Insatisfeito'
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [filterType, setFilterType] = useState<"today" | "week" | "all">("today");
  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({});
  
  const { data: stats, isLoading: statsLoading, error: statsError } = useFeedbackStats(dateRange);
  const { data: history, isLoading: historyLoading } = useFeedbackHistory(1, 10);
  const { mutate: exportData, isPending: isExporting } = useExportData();

  if (statsError) {
    // Basic auth check fallback - redirect if unauthorized
    if (statsError.message.includes("Unauthorized")) {
      setLocation("/admin/login");
      return null;
    }
  }

  const handleFilterChange = (type: "today" | "week" | "all", startDate?: string, endDate?: string) => {
    setFilterType(type);
    setDateRange({ startDate, endDate });
  };

  const handleLogout = () => {
    // In a real app we'd clear cookies/tokens
    setLocation("/admin/login");
  };

  const chartData = [
    { name: 'Muito Satisfeito', value: stats?.breakdown.very_satisfied || 0, key: 'very_satisfied' },
    { name: 'Satisfeito', value: stats?.breakdown.satisfied || 0, key: 'satisfied' },
    { name: 'Insatisfeito', value: stats?.breakdown.unsatisfied || 0, key: 'unsatisfied' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-body">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl text-slate-900">Analytics</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-display">Visão Geral</h1>
            <p className="text-slate-500 mt-1">Acompanhe a satisfação dos seus clientes em tempo real.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <DateRangeFilter activeFilter={filterType} onFilterChange={handleFilterChange} />
            <Button 
              variant="default" 
              className="gap-2 bg-primary hover:bg-primary/90"
              onClick={() => exportData({ format: "csv", ...dateRange })}
              disabled={isExporting}
            >
              <Download className="w-4 h-4" />
              {isExporting ? "Exportando..." : "Exportar CSV"}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Avaliações"
            value={stats?.total || 0}
            icon={<MessageSquare className="w-6 h-6" />}
            loading={statsLoading}
            className="border-l-4 border-l-primary"
          />
          <StatsCard
            title="Muito Satisfeito"
            value={`${stats?.percentages.very_satisfied || 0}%`}
            icon={<Smile className="w-6 h-6 text-green-500" />}
            loading={statsLoading}
            className="border-l-4 border-l-green-500"
          />
          <StatsCard
            title="Satisfeito"
            value={`${stats?.percentages.satisfied || 0}%`}
            icon={<Meh className="w-6 h-6 text-yellow-500" />}
            loading={statsLoading}
            className="border-l-4 border-l-yellow-500"
          />
          <StatsCard
            title="Insatisfeito"
            value={`${stats?.percentages.unsatisfied || 0}%`}
            icon={<Frown className="w-6 h-6 text-red-500" />}
            loading={statsLoading}
            className="border-l-4 border-l-red-500"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6 font-display">Distribuição de Votos</h3>
            <div className="h-[300px] w-full">
              {statsLoading ? (
                <div className="h-full flex items-center justify-center bg-slate-50 rounded-lg">
                  <span className="text-slate-400">Carregando dados...</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false}
                      width={120}
                      tick={{ fill: '#64748b', fontSize: 14 }} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.key as keyof typeof COLORS]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Daily Trend / Pie Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6 font-display">Proporção</h3>
            <div className="h-[300px] w-full flex items-center justify-center">
               {statsLoading ? (
                <div className="text-slate-400">Carregando...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.key as keyof typeof COLORS]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" /> Muito Satisfeito
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" /> Satisfeito
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" /> Insatisfeito
              </div>
            </div>
          </div>
        </div>

        {/* Recent History Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 font-display">Histórico Recente</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Data e Hora</th>
                  <th className="px-6 py-4">Avaliação</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyLoading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400">Carregando histórico...</td>
                  </tr>
                ) : history?.data.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400">Nenhuma avaliação encontrada.</td>
                  </tr>
                ) : (
                  history?.data.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-600">
                        {format(new Date(item.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: pt })}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {LABELS[item.rating]}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${item.rating === 'very_satisfied' ? 'bg-green-100 text-green-800' : 
                            item.rating === 'satisfied' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          Confirmado
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
