import { api } from '@/lib/api';
import { readEnvelopeErrorMessage } from '@/lib/services/_shared/envelope';

export type IncomeSummaryQuery = {
  from?: string;
  to?: string;
};

export type IncomeSummaryResponse = {
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
      grossIncomeUsd: number;
      collectedUsd: number;
      pendingBalanceUsd: number;
      igtfCollectedUsd: number;
      collectionRate: number;
      averageTicketUsd: number;
      totalInvoices: number;
      paidInvoices: number;
      pendingInvoices: number;
      grossIncomeTrendPct: number;
      collectedTrendPct: number;
      pendingBalanceTrendPct: number;
    };
    breakdownBySpecialty: Array<{
      specialtyId: number | null;
      specialty: string;
      consultations: number;
      incomeUsd: number;
      percentage: number;
      averageTicketUsd: number;
    }>;
    collectionByPaymentMethod: Array<{
      paymentMethodId: number | null;
      paymentMethod: string;
      type: string;
      currency: string;
      payments: number;
      amountUsd: number;
      igtfUsd: number;
      percentage: number;
    }>;
    receivables: {
      totalOutstandingUsd: number;
      overdueCount: number;
      averageAgeDays: number;
      agingBuckets: Array<{
        label: string;
        minDays: number;
        maxDays: number | null;
        count: number;
        amountUsd: number;
      }>;
      items: Array<{
        invoiceId: number;
        patientName: string;
        specialty: string;
        invoiceDate: string;
        totalUsd: number;
        collectedUsd: number;
        pendingUsd: number;
        daysOutstanding: number;
        status: string;
      }>;
    };
    alerts: Array<{
      severity: 'info' | 'success' | 'warning' | 'danger';
      message: string;
      invoiceId?: number;
      amountUsd?: number;
    }>;
  };
};

export const getIncomeSummary = async (params: IncomeSummaryQuery = {}): Promise<IncomeSummaryResponse> => {
  const searchParams = new URLSearchParams();
  if (params.from) searchParams.set('from', params.from);
  if (params.to) searchParams.set('to', params.to);

  const endpoint = searchParams.toString() ? `/report/income-summary?${searchParams.toString()}` : '/report/income-summary';
  const response = await api(endpoint, { method: 'GET' });

  if (!response.ok) {
    throw new Error(await readEnvelopeErrorMessage(response));
  }

  return (await response.json()) as IncomeSummaryResponse;
};
