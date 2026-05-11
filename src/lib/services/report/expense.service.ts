import { api } from '@/lib/api';
import { readEnvelopeErrorMessage } from '@/lib/services/_shared/envelope';

export type ExpenseSummaryQuery = {
  from?: string;
  to?: string;
};

export type ExpenseSummaryResponse = {
  message: string;
  data: {
    meta: {
      from: string;
      to: string;
      previousFrom: string;
      previousTo: string;
      periodDays: number;
    };
    summary: {
      totalExpenseUsd: number;
      opexUsd: number;
      purchasesUsd: number;
      payrollUsd: number;
      salaryAdminUsd: number;
      invoiceExpenseCount: number;
      purchaseCount: number;
      payrollDoctorCount: number;
      payrollSalaryCount: number;
      expenseTrendPct: number;
    };
    breakdownByCategory: Array<{
      categoryId: number | null;
      category: string;
      amountUsd: number;
      percentage: number;
    }>;
    servicesBySupplier: Array<{
      supplierId: number | null;
      supplier: string;
      totalUsd: number;
      paidUsd: number;
      pendingUsd: number;
      invoices: number;
    }>;
    purchasesByCategory: Array<{
      categoryId: number | null;
      category: string;
      amountUsd: number;
      percentage: number;
    }>;
    payrollBySpecialty: Array<{
      specialtyId: number | null;
      specialty: string;
      employees: number;
      amountUsd: number;
    }>;
    salaryByRole: Array<{
      roleId: number | null;
      role: string;
      employees: number;
      amountUsd: number;
    }>;
    alerts: Array<{
      severity: 'info' | 'success' | 'warning' | 'danger';
      message: string;
      amountUsd?: number;
    }>;
  };
};

export const getExpenseSummary = async (params: ExpenseSummaryQuery = {}): Promise<ExpenseSummaryResponse> => {
  const searchParams = new URLSearchParams();
  if (params.from) searchParams.set('from', params.from);
  if (params.to) searchParams.set('to', params.to);

  const endpoint = searchParams.toString() ? `/report/expense-summary?${searchParams.toString()}` : '/report/expense-summary';
  const response = await api(endpoint, { method: 'GET' });

  if (!response.ok) {
    throw new Error(await readEnvelopeErrorMessage(response));
  }

  return (await response.json()) as ExpenseSummaryResponse;
};
