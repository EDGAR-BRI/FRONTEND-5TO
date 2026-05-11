import { api } from '@/lib/api';
import { readEnvelopeErrorMessage } from '@/lib/services/_shared/envelope';

export type MonthlyRevenueQuery = {
	from?: string;
	to?: string;
	period?: 'day' | 'week' | 'month' | 'year';
};

export type MonthlyRevenueResponse = {
	message: string;
	data: {
		meta: {
			from: string;
			to: string;
			period: 'day' | 'week' | 'month' | 'year';
		};
		bars: Array<{
			label: string;
			periodStart: string;
			periodEnd: string;
			incomeUsd: number;
			consultations: number;
		}>;
	};
};

export const getMonthlyRevenue = async (params: MonthlyRevenueQuery = {}): Promise<MonthlyRevenueResponse> => {
	const searchParams = new URLSearchParams();
	if (params.from) searchParams.set('from', params.from);
	if (params.to) searchParams.set('to', params.to);
	if (params.period) searchParams.set('period', params.period);

	const endpoint = searchParams.toString() ? `/report/monthly-revenue?${searchParams.toString()}` : '/report/monthly-revenue';
	const response = await api(endpoint, { method: 'GET' });

	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}

	return (await response.json()) as MonthlyRevenueResponse;
};
