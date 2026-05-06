import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type { PayrollRecord, UpdatePayrollDto } from "./payroll.interface";

const BASE_PATH = "finance/payroll";

export const listPayrolls = async (): Promise<PayrollRecord[]> => {
	const response = await api(BASE_PATH, { method: "GET" });
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	return readEnvelopeData<PayrollRecord[]>(response);
};

export const updatePayroll = async (id: number, payload: UpdatePayrollDto): Promise<PayrollRecord> => {
	const response = await api(`${BASE_PATH}/${id}`, {
		method: "PUT",
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	return readEnvelopeData<PayrollRecord>(response);
};