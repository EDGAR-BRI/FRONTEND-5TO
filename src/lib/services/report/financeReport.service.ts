import { api } from '@/lib/api';
import { readEnvelopeErrorMessage } from '@/lib/services/_shared/envelope';

export type FinanceReportQuery = {
	from?: string;
	to?: string;
	doctorId?: number;
};

export type FinanceStats = {
	totalRevenue: number;
	totalExpenses: number;
	netProfit: number;
	consultationRevenue: number;
	examRevenue: number;
	procedureRevenue: number;
	growthRate: number;
	profitMargin: number;
};

export type MonthlyRevenue = {
	month: string;
	revenue: number;
	expenses: number;
	profit: number;
};

export type RevenueSource = {
	source: string;
	amount: number;
	percentage: number;
	color?: string;
};

export type RecentTransaction = {
	id: number;
	description: string;
	amount: number;
	type: 'income' | 'expense';
	date: string;
	category: string;
};

export type FinanceReportResponse = {
	message: string;
	data: {
		meta: {
			from: string;
			to: string;
			doctorId: number;
		};
		stats: FinanceStats;
		monthlyData: MonthlyRevenue[];
		revenueSources: RevenueSource[];
		recentTransactions: RecentTransaction[];
	};
};

export const getFinanceReport = async (params: FinanceReportQuery = {}): Promise<FinanceReportResponse> => {
	const searchParams = new URLSearchParams();
	if (params.from) searchParams.set('from', params.from);
	if (params.to) searchParams.set('to', params.to);
	if (params.doctorId) searchParams.set('doctorId', params.doctorId.toString());

	const endpoint = searchParams.toString() ? `/report/finance?${searchParams.toString()}` : '/report/finance';
	const response = await api(endpoint, { method: 'GET' });

	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}

	return (await response.json()) as FinanceReportResponse;
};

// Función para exportar el reporte financiero a PDF
export const exportFinanceReportPDF = async (params: FinanceReportQuery = {}): Promise<Blob> => {
	const searchParams = new URLSearchParams();
	if (params.from) searchParams.set('from', params.from);
	if (params.to) searchParams.set('to', params.to);
	if (params.doctorId) searchParams.set('doctorId', params.doctorId.toString());

	const endpoint = searchParams.toString() ? `/report/finance/export?${searchParams.toString()}` : '/report/finance/export';
	const response = await api(endpoint, { method: 'GET' });

	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}

	return await response.blob();
};
