import { api } from "@/lib/api";
import { readEnvelopeErrorMessage } from "@/lib/services/_shared/envelope";

export type DoctorFinanceQuery = {
  from?: string;
  to?: string;
  userId?: number;
};

export type DoctorFinanceResponse = {
  message: string;
  data: {
    meta: {
      from: string;
      to: string;
    };
    stats: {
      totalRevenue: number;
      totalExpenses: number;
      netProfit: number;
      doctorEarnings: number;
      doctorCommission: number;
    };
    monthlyData: Array<{
      month: string;
      revenue: number;
      expenses: number;
      profit: number;
      doctorEarnings: number;
    }>;
    revenueSources: Array<{
      source: string;
      amount: number;
    }>;
    recentTransactions: Array<{
      id: number;
      description: string;
      category: string;
      type: "income" | "expense";
      amount: number;
      date: string;
    }>;
    exchangeRate: number;
  };
};

const buildEndpoint = (params: DoctorFinanceQuery = {}) => {
  const searchParams = new URLSearchParams();
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  if (params.userId) searchParams.set("userId", String(params.userId));
  const basePath = "/report/doctor/finance";
  return searchParams.toString() ? `${basePath}?${searchParams.toString()}` : basePath;
};

export const getDoctorFinanceReport = async (
  params: DoctorFinanceQuery = {},
): Promise<DoctorFinanceResponse> => {
  const response = await api(buildEndpoint(params), { method: "GET" });
  if (!response.ok) throw new Error(await readEnvelopeErrorMessage(response));
  return (await response.json()) as DoctorFinanceResponse;
};
