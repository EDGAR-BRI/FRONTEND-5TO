import { api } from '@/lib/api';
import { readEnvelopeErrorMessage } from '@/lib/services/_shared/envelope';

export type AppointmentsReportQuery = {
	from?: string;
	to?: string;
	doctorId?: number;
	status?: 'scheduled' | 'completed' | 'cancelled' | 'all';
};

export type AppointmentStats = {
	total: number;
	completed: number;
	cancelled: number;
	scheduled: number;
	completionRate: number;
	cancellationRate: number;
};

export type DailyAppointments = {
	date: string;
	total: number;
	completed: number;
	cancelled: number;
};

export type PatientAppointmentData = {
	patientId: number;
	patientName: string;
	totalAppointments: number;
	completedAppointments: number;
	cancelledAppointments: number;
	lastAppointmentDate: string;
};

export type AppointmentsReportResponse = {
	message: string;
	data: {
		meta: {
			from: string;
			to: string;
			doctorId: number;
		};
		stats: AppointmentStats;
		dailyData: DailyAppointments[];
		topPatients: PatientAppointmentData[];
	};
};

export const getAppointmentsReport = async (params: AppointmentsReportQuery = {}): Promise<AppointmentsReportResponse> => {
	const searchParams = new URLSearchParams();
	if (params.from) searchParams.set('from', params.from);
	if (params.to) searchParams.set('to', params.to);
	if (params.doctorId) searchParams.set('doctorId', params.doctorId.toString());
	if (params.status) searchParams.set('status', params.status);

	const endpoint = searchParams.toString() ? `/report/appointments?${searchParams.toString()}` : '/report/appointments';
	const response = await api(endpoint, { method: 'GET' });

	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}

	return (await response.json()) as AppointmentsReportResponse;
};

// Función para exportar el reporte de citas a PDF
export const exportAppointmentsReportPDF = async (params: AppointmentsReportQuery = {}): Promise<Blob> => {
	const searchParams = new URLSearchParams();
	if (params.from) searchParams.set('from', params.from);
	if (params.to) searchParams.set('to', params.to);
	if (params.doctorId) searchParams.set('doctorId', params.doctorId.toString());
	if (params.status) searchParams.set('status', params.status);

	const endpoint = searchParams.toString() ? `/report/appointments/export?${searchParams.toString()}` : '/report/appointments/export';
	const response = await api(endpoint, { method: 'GET' });

	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}

	return await response.blob();
};
