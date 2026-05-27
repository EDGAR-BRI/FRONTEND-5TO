import { api } from '@/lib/api';
import { readEnvelopeErrorMessage } from '@/lib/services/_shared/envelope';

export type OperativosQuery = {
	from?: string;
	to?: string;
	period?: 'day' | 'week' | 'month' | 'year';
};

export type OperativosOverviewResponse = {
	message: string;
	data: {
		meta: {
			from: string;
			to: string;
			period: 'day' | 'week' | 'month' | 'year';
		};
		stats: {
			scheduledAppointments: number;
			avgAttentionTime: number;
			patientsAttended: number;
			activeDoctors: number;
		};
		periodSummary: {
			activeDoctors: number;
			revenueUsd: number;
			appointments: number;
		};
		occupancyBySlot: Array<{
			slot: string;
			count: number;
			status: 'Normal' | 'Alto' | 'Critico';
		}>;
	};
};

export type OperativosCitasResponse = {
	message: string;
	data: {
		meta: {
			from: string;
			to: string;
			period: 'day' | 'week' | 'month' | 'year';
		};
		stats: {
			totalAppointments: number;
			completedAppointments: number;
			cancelledAppointments: number;
			completionRate: number;
			cancellationRate: number;
		};
		dailyData: Array<{
			date: string;
			attended: number;
			cancelled: number;
		}>;
	};
};

export type OperativosTiemposResponse = {
	message: string;
	data: {
		meta: {
			from: string;
			to: string;
			period: 'day' | 'week' | 'month' | 'year';
		};
		stats: {
			avgConsultTime: number;
			totalConsultations: number;
			peakHour: string;
			peakHourCount: number;
		};
		bySpecialty: Array<{
			area: string;
			consult: number;
			consultations: number;
		}>;
	};
};

export type OperativosProductividadResponse = {
	message: string;
	data: {
		meta: {
			from: string;
			to: string;
			period: 'day' | 'week' | 'month' | 'year';
		};
		stats: {
			doctorsInShift: number;
			avgAttentions: number;
			avgRevenue: number;
		};
		byDoctor: Array<{
			name: string;
			attended: number;
			avgTime: number;
			revenue: number;
		}>;
	};
};

const buildEndpoint = (path: string, params: OperativosQuery = {}) => {
	const searchParams = new URLSearchParams();
	if (params.from) searchParams.set('from', params.from);
	if (params.to) searchParams.set('to', params.to);
	if (params.period) searchParams.set('period', params.period);
	return searchParams.toString() ? `${path}?${searchParams.toString()}` : path;
};

export const getOperativosOverview = async (params: OperativosQuery = {}): Promise<OperativosOverviewResponse> => {
	const response = await api(buildEndpoint('/report/operativos/overview', params), { method: 'GET' });
	if (!response.ok) throw new Error(await readEnvelopeErrorMessage(response));
	return (await response.json()) as OperativosOverviewResponse;
};

export const getOperativosCitas = async (params: OperativosQuery = {}): Promise<OperativosCitasResponse> => {
	const response = await api(buildEndpoint('/report/operativos/citas', params), { method: 'GET' });
	if (!response.ok) throw new Error(await readEnvelopeErrorMessage(response));
	return (await response.json()) as OperativosCitasResponse;
};

export const getOperativosTiempos = async (params: OperativosQuery = {}): Promise<OperativosTiemposResponse> => {
	const response = await api(buildEndpoint('/report/operativos/tiempos', params), { method: 'GET' });
	if (!response.ok) throw new Error(await readEnvelopeErrorMessage(response));
	return (await response.json()) as OperativosTiemposResponse;
};

export const getOperativosProductividad = async (params: OperativosQuery = {}): Promise<OperativosProductividadResponse> => {
	const response = await api(buildEndpoint('/report/operativos/productividad', params), { method: 'GET' });
	if (!response.ok) throw new Error(await readEnvelopeErrorMessage(response));
	return (await response.json()) as OperativosProductividadResponse;
};
