import { api } from '@/lib/api';
import { readEnvelopeErrorMessage } from '@/lib/services/_shared/envelope';

export type SpecialtyDemandQuery = {
	from?: string;
	to?: string;
};

export type SpecialtyDemandResponse = {
	message: string;
	data: {
		meta: {
			from: string;
			to: string;
		};
		items: Array<{
			specialtyId: number | null;
			specialty: string;
			consultations: number;
			percentage: number;
		}>;
	};
};

export const getSpecialtyDemand = async (params: SpecialtyDemandQuery = {}): Promise<SpecialtyDemandResponse> => {
	const searchParams = new URLSearchParams();
	if (params.from) searchParams.set('from', params.from);
	if (params.to) searchParams.set('to', params.to);

	const endpoint = searchParams.toString() ? `/report/specialty-demand?${searchParams.toString()}` : '/report/specialty-demand';
	const response = await api(endpoint, { method: 'GET' });

	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}

	return (await response.json()) as SpecialtyDemandResponse;
};
