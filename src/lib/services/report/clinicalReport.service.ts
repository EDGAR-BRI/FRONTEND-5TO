import { api } from '@/lib/api';
import { readEnvelopeErrorMessage } from '@/lib/services/_shared/envelope';

export type ClinicalReportQuery = {
	from?: string;
	to?: string;
	doctorId?: number;
};

export type ClinicalReportStats = {
	totalConsultations: number;
	newPatients: number;
	examsPerformed: number;
	consultationsGrowth: number;
	patientsGrowth: number;
	examsGrowth: number;
};

export type PathologyData = {
	name: string;
	total: number;
	percentage: number;
	color?: string;
};

export type RecentDiagnosis = {
	id: number;
	patientName: string;
	diagnosis: string;
	date: string;
	status: 'confirmed' | 'pending' | 'rejected';
};

export type ClinicalReportResponse = {
	message: string;
	data: {
		meta: {
			from: string;
			to: string;
			doctorId: number;
		};
		stats: ClinicalReportStats;
		pathologies: PathologyData[];
		recentDiagnoses: RecentDiagnosis[];
	};
};

export const getClinicalReport = async (params: ClinicalReportQuery = {}): Promise<ClinicalReportResponse> => {
	const searchParams = new URLSearchParams();
	if (params.from) searchParams.set('from', params.from);
	if (params.to) searchParams.set('to', params.to);
	if (params.doctorId) searchParams.set('doctorId', params.doctorId.toString());

	const endpoint = searchParams.toString() ? `/report/clinical?${searchParams.toString()}` : '/report/clinical';
	const response = await api(endpoint, { method: 'GET' });

	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}

	return (await response.json()) as ClinicalReportResponse;
};

// Función para exportar el reporte clínico a PDF
export const exportClinicalReportPDF = async (params: ClinicalReportQuery = {}): Promise<Blob> => {
	const searchParams = new URLSearchParams();
	if (params.from) searchParams.set('from', params.from);
	if (params.to) searchParams.set('to', params.to);
	if (params.doctorId) searchParams.set('doctorId', params.doctorId.toString());

	const endpoint = searchParams.toString() ? `/report/clinical/export?${searchParams.toString()}` : '/report/clinical/export';
	const response = await api(endpoint, { method: 'GET' });

	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}

	return await response.blob();
};
