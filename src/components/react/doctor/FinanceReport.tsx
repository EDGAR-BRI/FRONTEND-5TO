import React, { useMemo, useState } from "react";
import {
  FaPrint,
  FaDollarSign,
  FaArrowTrendUp,
  FaMoneyBillWave,
  FaSpinner,
} from "react-icons/fa6";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { StatsCard } from "@/components/react/primary/StatsCard";
import StaticCard from "@/components/react/primary/StaticCard";
import { Modal } from "@/components/react/primary/Modal";

export default function FinanceReport() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState({
    from: "",
    to: "",
  });
  const [quickRange, setQuickRange] = useState<null | "week" | "month" | "year">(
    null,
  );

  const mockData = {
    stats: {
      totalRevenue: 125000,
      totalExpenses: 45000,
      netProfit: 80000,
      profitMargin: 64,
      growthRate: 12,
    },
    monthlyData: [
      { month: "Ene", revenue: 95000, expenses: 35000, profit: 60000 },
      { month: "Feb", revenue: 102000, expenses: 38000, profit: 64000 },
      { month: "Mar", revenue: 108000, expenses: 40000, profit: 68000 },
      { month: "Abr", revenue: 115000, expenses: 42000, profit: 73000 },
      { month: "May", revenue: 125000, expenses: 45000, profit: 80000 },
    ],
    revenueSources: [
      { source: "Consultas", amount: 75000 },
      { source: "Procedimientos", amount: 30000 },
      { source: "Laboratorio", amount: 15000 },
      { source: "Otros", amount: 5000 },
    ],
    recentTransactions: [
      {
        id: 1,
        description: "Consulta - María González",
        category: "Consultas",
        type: "income",
        amount: 2500,
        date: "2026-05-15",
      },
      {
        id: 2,
        description: "Pago de suministros",
        category: "Gastos",
        type: "expense",
        amount: 3500,
        date: "2026-05-14",
      },
      {
        id: 3,
        description: "Procedimiento - Carlos R.",
        category: "Procedimientos",
        type: "income",
        amount: 4500,
        date: "2026-05-14",
      },
      {
        id: 4,
        description: "Laboratorio - Ana M.",
        category: "Laboratorio",
        type: "income",
        amount: 1800,
        date: "2026-05-13",
      },
      {
        id: 5,
        description: "Mantenimiento equipo",
        category: "Gastos",
        type: "expense",
        amount: 2200,
        date: "2026-05-12",
      },
    ],
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setIsExportModalOpen(false);
    }, 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
    }).format(amount);
  };

  const parseMonthLabel = (value: string) => {
    const map: Record<string, number> = {
      Ene: 0,
      Feb: 1,
      Mar: 2,
      Abr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Ago: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dic: 11,
    };
    const monthIndex = map[value] ?? 0;
    return new Date(new Date().getFullYear(), monthIndex, 1);
  };

  const isWithinRange = (date: Date, from?: Date, to?: Date) => {
    if (from && date < from) return false;
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      if (date > end) return false;
    }
    return true;
  };

  const fromDate = filters.from ? new Date(filters.from) : undefined;
  const toDate = filters.to ? new Date(filters.to) : undefined;
  const rangeDays =
    fromDate && toDate
      ? Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) +
      1
      : null;
  const chartGranularity =
    quickRange === "week"
      ? "day"
      : quickRange === "month"
        ? "day"
        : quickRange === "year"
          ? "month"
          : rangeDays !== null
            ? rangeDays <= 31
              ? "day"
              : "month"
            : "month";

  const filteredMonthlyData = useMemo(() => {
    return mockData.monthlyData.filter((item) =>
      isWithinRange(parseMonthLabel(item.month), fromDate, toDate),
    );
  }, [mockData.monthlyData, fromDate, toDate]);

  const filteredTransactions = useMemo(() => {
    return mockData.recentTransactions.filter((transaction) => {
      const date = new Date(transaction.date);
      return isWithinRange(date, fromDate, toDate);
    });
  }, [mockData.recentTransactions, fromDate, toDate]);

  const statsFromMonthly = useMemo(() => {
    return filteredMonthlyData.reduce(
      (acc, item) => {
        acc.revenue += item.revenue;
        acc.expenses += item.expenses;
        acc.profit += item.profit;
        return acc;
      },
      { revenue: 0, expenses: 0, profit: 0 },
    );
  }, [filteredMonthlyData]);

  const statsFromTransactions = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "income") {
          acc.revenue += transaction.amount;
        } else {
          acc.expenses += transaction.amount;
        }
        acc.profit = acc.revenue - acc.expenses;
        return acc;
      },
      { revenue: 0, expenses: 0, profit: 0 },
    );
  }, [filteredTransactions]);

  const filteredStats = useMemo(() => {
    const baseStats =
      rangeDays === null || rangeDays > 31 ? statsFromMonthly : statsFromTransactions;
    const margin = baseStats.revenue
      ? Math.round((baseStats.profit / baseStats.revenue) * 100)
      : 0;
    return {
      totalRevenue: baseStats.revenue,
      totalExpenses: baseStats.expenses,
      netProfit: baseStats.profit,
      profitMargin: margin,
      growthRate: mockData.stats.growthRate,
    };
  }, [rangeDays, statsFromMonthly, statsFromTransactions, mockData.stats.growthRate]);

  const filteredRevenueSources = useMemo(() => {
    return mockData.revenueSources;
  }, [mockData.revenueSources]);

  const applyQuickRange = (range: "week" | "month" | "year") => {
    const today = new Date();
    const end = today.toISOString().slice(0, 10);
    let startDate = new Date(today);

    if (range === "week") {
      startDate.setDate(startDate.getDate() - 6);
    }

    if (range === "month") {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    if (range === "year") {
      startDate = new Date(today.getFullYear(), 0, 1);
    }

    const start = startDate.toISOString().slice(0, 10);
    setFilters({ from: start, to: end });
    setQuickRange(range);
  };

  const chartData = useMemo(() => {
    if (chartGranularity === "month") {
      return filteredMonthlyData.map((item) => ({
        period: item.month,
        revenue: item.revenue,
        expenses: item.expenses,
        profit: item.profit,
      }));
    }

    if (!fromDate || !toDate) {
      return [];
    }

    if (chartGranularity === "day") {
      const days: {
        period: string;
        revenue: number;
        expenses: number;
        profit: number;
      }[] = [];
      const cursor = new Date(fromDate);
      while (cursor <= toDate) {
        const label = cursor.toLocaleDateString("es-VE", {
          day: "2-digit",
          month: "2-digit",
        });
        days.push({ period: label, revenue: 0, expenses: 0, profit: 0 });
        cursor.setDate(cursor.getDate() + 1);
      }

      const indexMap = new Map(days.map((item, index) => [item.period, index]));
      filteredTransactions.forEach((transaction) => {
        const date = new Date(transaction.date);
        const label = date.toLocaleDateString("es-VE", {
          day: "2-digit",
          month: "2-digit",
        });
        const targetIndex = indexMap.get(label);
        if (targetIndex === undefined) return;
        if (transaction.type === "income") {
          days[targetIndex].revenue += transaction.amount;
        } else {
          days[targetIndex].expenses += transaction.amount;
        }
        days[targetIndex].profit =
          days[targetIndex].revenue - days[targetIndex].expenses;
      });

      return days;
    }

    const weekMap = new Map<
      number,
      { period: string; revenue: number; expenses: number; profit: number }
    >();
    filteredTransactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const weekIndex = Math.ceil(date.getDate() / 7);
      if (!weekMap.has(weekIndex)) {
        weekMap.set(weekIndex, {
          period: `Semana ${weekIndex}`,
          revenue: 0,
          expenses: 0,
          profit: 0,
        });
      }
      const bucket = weekMap.get(weekIndex);
      if (!bucket) return;
      if (transaction.type === "income") {
        bucket.revenue += transaction.amount;
      } else {
        bucket.expenses += transaction.amount;
      }
      bucket.profit = bucket.revenue - bucket.expenses;
    });

    return Array.from(weekMap.values()).sort((a, b) => {
      const aIndex = Number(a.period.replace("Semana ", ""));
      const bIndex = Number(b.period.replace("Semana ", ""));
      return aIndex - bIndex;
    });
  }, [
    chartGranularity,
    filteredMonthlyData,
    filteredTransactions,
    fromDate,
    toDate,
  ]);

  const revenueSourcesColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 data-nums-compact">
        <StatsCard
          title="Ingresos Totales"
          value={formatCurrency(filteredStats.totalRevenue)}
          color="primary"
          icon={<FaDollarSign size={18} />}
          trendUp={filteredStats.growthRate >= 0}
          variant="compact"
        />
        <StatsCard
          title="Gastos Totales"
          value={formatCurrency(filteredStats.totalExpenses)}
          color="danger"
          icon={<FaMoneyBillWave size={18} />}
          variant="compact"
        />
        <StatsCard
          title="Ganancia Neta"
          value={formatCurrency(filteredStats.netProfit)}
          color="success"
          icon={<FaDollarSign size={18} />}
          variant="compact"
        />
        <StatsCard
          title="Margen de Ganancia"
          value={`${filteredStats.profitMargin}%`}
          color="primary"
          icon={<FaArrowTrendUp size={18} />}
          variant="compact"
        />
      </div>

      <StaticCard className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">
              Filtros
            </h3>
            <button
              type="button"
              onClick={() => {
                setFilters({ from: "", to: "" });
                setQuickRange(null);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition"
            >
              Limpiar filtros
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-xs font-semibold text-slate-600 flex flex-col gap-2">
              Desde
              <input
                type="date"
                value={filters.from}
                onChange={(event) => {
                  setFilters((prev) => ({ ...prev, from: event.target.value }));
                  setQuickRange(null);
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
            <label className="text-xs font-semibold text-slate-600 flex flex-col gap-2">
              Hasta
              <input
                type="date"
                value={filters.to}
                onChange={(event) => {
                  setFilters((prev) => ({ ...prev, to: event.target.value }));
                  setQuickRange(null);
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyQuickRange("week")}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Semana
            </button>
            <button
              type="button"
              onClick={() => applyQuickRange("month")}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Mes
            </button>
            <button
              type="button"
              onClick={() => applyQuickRange("year")}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Año
            </button>
          </div>
        </div>
      </StaticCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StaticCard className="p-8">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest mb-6">
            Evolución Mensual
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="period"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: any, name: string) => {
                    const labels: Record<string, string> = {
                      revenue: "Ganancias por consultas",
                      expenses: "Gastos en insumos",
                    };
                    return [formatCurrency(value), labels[name] || name];
                  }}
                />
                <Bar
                  dataKey="revenue"
                  name="Ganancias por consultas"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
                  name="Gastos en insumos"
                  fill="#ef4444"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </StaticCard>

        <StaticCard className="p-8">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest mb-6">
            Tendencia de Ganancias
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="period"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </StaticCard>
      </div>

      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Exportar Reporte Financiero"
      >
        <div className="space-y-4">
          <p className="text-slate-700">
            ¿Desea exportar el reporte financiero en formato PDF?
          </p>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">El reporte incluirá:</p>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>
                • Estadísticas de citas (total, completadas, canceladas,
                programadas)
              </li>
              <li>• Gráfica de evolución diaria</li>
              <li>• Distribución por estado</li>
              <li>• Lista de pacientes más frecuentes</li>
            </ul>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsExportModalOpen(false)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <FaSpinner className="animate-spin" /> Exportando...
                </>
              ) : (
                <>
                  <FaPrint /> Exportar
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .data-nums-compact h3, 
        .data-nums-compact [class*="text-2xl"], 
        .data-nums-compact span {
          font-size: 1.125rem !important;
          line-height: 1.75rem !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          max-width: 100% !important;
        }
        .data-nums-compact div[class*="relative"] {
          overflow: hidden !important;
        }
      `,
        }}
      />
    </div>
  );
}
