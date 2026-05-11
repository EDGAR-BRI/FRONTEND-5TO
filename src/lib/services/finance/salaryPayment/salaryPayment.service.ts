import { api } from '@/lib/api';
import { readEnvelopeData, readEnvelopeErrorMessage } from '../../_shared/envelope';
import type { PendingSalarySummaryResponse, SalaryPaymentCreateDto, SalaryPaymentRecord } from './salaryPayment.interface';

const BASE_PATH = 'finance/salary-payment';

export const getPendingSalarySummary = async (): Promise<PendingSalarySummaryResponse> => {
	const response = await api(`${BASE_PATH}/pending-summary`, { method: 'GET' });
	if (!response.ok) throw new Error(await readEnvelopeErrorMessage(response));
	return readEnvelopeData<PendingSalarySummaryResponse>(response);
};

export const createSalaryPayment = async (payload: SalaryPaymentCreateDto): Promise<SalaryPaymentRecord> => {
	const response = await api(BASE_PATH, {
		method: 'POST',
		body: JSON.stringify(payload),
	});
	if (!response.ok) throw new Error(await readEnvelopeErrorMessage(response));
	return readEnvelopeData<SalaryPaymentRecord>(response);
};

export const listSalaryPayments = async (): Promise<SalaryPaymentRecord[]> => {
	const response = await api(BASE_PATH, { method: 'GET' });
	if (!response.ok) throw new Error(await readEnvelopeErrorMessage(response));
	return readEnvelopeData<SalaryPaymentRecord[]>(response);
};
