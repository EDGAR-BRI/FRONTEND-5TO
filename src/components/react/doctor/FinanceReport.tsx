import React, { useMemo, useState, useEffect } from "react";
import {
  FaPrint,
  FaDollarSign,
  FaArrowTrendUp,
  FaMoneyBillWave,
  FaSpinner,
} from "react-icons/fa6";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StatsCard } from "@/components/react/primary/StatsCard";
import StaticCard from "@/components/react/primary/StaticCard";
import { Modal } from "@/components/react/primary/Modal";
import { getDoctorFinanceReport } from "@/lib/services/report/doctorFinance.service";
import { Alert } from "@/utils/alerts";

type FinanceReportProps = {
  userId?: number;
};

export default function FinanceReport({ userId }: FinanceReportProps) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const currentYear = new Date().getFullYear();
  const [filters, setFilters] = useState({
    from: `${currentYear}-01-01`,
    to: `${currentYear}-12-31`,
  });
  const [quickRange, setQuickRange] = useState<null | "week" | "month" | "year">(
    null,
  );
  const [reportData, setReportData] = useState({
    stats: {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      doctorEarnings: 0,
      doctorCommission: 0,
    },
    monthlyData: [] as Array<{
      month: string;
      revenue: number;
      expenses: number;
      profit: number;
      doctorEarnings: number;
    }>,
    revenueSources: [] as Array<{ source: string; amount: number }>,
    recentTransactions: [] as Array<{
      id: number;
      description: string;
      category: string;
      type: "income" | "expense";
      amount: number;
      date: string;
    }>,
    exchangeRate: 1,
  });
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setIsExportModalOpen(false);
    }, 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatVES = (amount: number, rate: number) => {
    const converted = amount * rate;
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
    }).format(converted);
  };

  const parseMonthLabel = (value: string) => {
    const map: Record<string, number> = {
      "ene.": 0, "ene": 0, "Ene": 0, "Ene.": 0,
      "feb.": 1, "feb": 1, "Feb": 1, "Feb.": 1,
      "mar.": 2, "mar": 2, "Mar": 2, "Mar.": 2,
      "abr.": 3, "abr": 3, "Abr": 3, "Abr.": 3,
      "may.": 4, "may": 4, "May": 4, "May.": 4,
      "jun.": 5, "jun": 5, "Jun": 5, "Jun.": 5,
      "jul.": 6, "jul": 6, "Jul": 6, "Jul.": 6,
      "ago.": 7, "ago": 7, "Ago": 7, "Ago.": 7,
      "sep.": 8, "sep": 8, "Sep": 8, "Sep.": 8,
      "oct.": 9, "oct": 9, "Oct": 9, "Oct.": 9,
      "nov.": 10, "nov": 10, "Nov": 10, "Nov.": 10,
      "dic.": 11, "dic": 11, "Dic": 11, "Dic.": 11,
    };
    const normalized = value.trim().toLowerCase();
    const monthIndex = map[normalized] ?? map[value] ?? 0;
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
    return reportData.monthlyData.filter((item) =>
      isWithinRange(parseMonthLabel(item.month), fromDate, toDate),
    );
  }, [reportData.monthlyData, fromDate, toDate]);

  const filteredTransactions = useMemo(() => {
    return reportData.recentTransactions.filter((transaction) => {
      const date = new Date(transaction.date);
      return isWithinRange(date, fromDate, toDate);
    });
  }, [reportData.recentTransactions, fromDate, toDate]);

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

  useEffect(() => {
    const fetchReport = async () => {
      if (!userId || Number.isNaN(userId)) return;
      setIsLoadingReport(true);
      try {
        const response = await getDoctorFinanceReport({
          userId,
          from: filters.from || undefined,
          to: filters.to || undefined,
        });
        console.log("[FinanceReport] Datos recibidos:", response.data);
        setReportData({
          stats: response.data.stats,
          monthlyData: response.data.monthlyData,
          revenueSources: response.data.revenueSources,
          recentTransactions: response.data.recentTransactions,
          exchangeRate: response.data.exchangeRate,
        });
      } catch (error: any) {
        Alert.error(error.message ?? "No se pudo cargar el reporte financiero");
      } finally {
        setIsLoadingReport(false);
      }
    };

    fetchReport();
  }, [userId, filters.from, filters.to]);

  const chartData = useMemo(() => {
    if (chartGranularity === "month") {
      return filteredMonthlyData.map((item) => ({
        period: item.month,
        revenue: item.revenue,
        expenses: item.expenses,
        profit: item.doctorEarnings,
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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row gap-4 data-nums-compact w-full">
        <StatsCard 
        className="flex-1"
          title="Ganancias"
          value={formatCurrency(reportData.stats.doctorEarnings)}
          color="success"
          icon={<FaDollarSign size={18} />}
          variant="compact"
          subText={`≈ ${formatVES(reportData.stats.doctorEarnings, reportData.exchangeRate)}`}
        />
        <StatsCard
          className="flex-1"
          title="Comisión por consulta"
          value={`${reportData.stats.doctorCommission}%`}
          color="success"
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
                setFilters({ from: `${currentYear}-01-01`, to: `${currentYear}-12-31` });
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
                max={filters.to}
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
                min={filters.from}
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
                  formatter={(value: any) => [
                    `${formatCurrency(value)} (≈ ${formatVES(value, reportData.exchangeRate)})`,
                    "Ganancia",
                  ]}
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

        <StaticCard className="p-8">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest mb-6">
            Desglose de Consultas
          </h3>
          <div className="h-80 w-full overflow-y-auto space-y-3 pr-1">
            {filteredTransactions.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-slate-400">
                No hay consultas en el rango seleccionado.
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {tx.description}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(tx.date).toLocaleDateString("es-VE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      &middot; {tx.category}
                    </p>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <p className="text-sm font-bold text-emerald-600">
                      {formatCurrency(tx.amount)}
                    </p>
                    <p className="text-xs text-slate-400">
                      ≈ {formatVES(tx.amount, reportData.exchangeRate)}
                    </p>
                  </div>
                </div>
              ))
            )}
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
              <li>• Resumen de ingresos y ganancias del doctor</li>
              <li>• Evolución mensual de ingresos</li>
              <li>• Distribución de fuentes de ingreso</li>
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
