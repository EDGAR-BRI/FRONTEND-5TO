import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "@/lib/services/_shared/envelope";

export interface ExpenseCategoryDto {
    id: number;
    name: string;
}

export interface CreateExpenseCategoryDto {
    name: string;
}

export interface UpdateExpenseCategoryDto {
    name?: string;
}

export interface InvoiceExpenseDto {
    id: number;
    total_amount: number | string;
    date_at?: string | null;
    categoryId?: number;
    category?: { id?: number; name?: string | null };
    supplier?: { id?: number; name?: string | null };
}

const PATH = "/expenses/category";

export const listExpenseCategories = async (): Promise<ExpenseCategoryDto[]> => {
	const response = await api(PATH, { method: "GET" });
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	return readEnvelopeData<ExpenseCategoryDto[]>(response);
};

export const listInvoiceExpenses = async (): Promise<InvoiceExpenseDto[]> => {
	const response = await api("/expenses/invoice-expense", { method: "GET" });
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	return readEnvelopeData<InvoiceExpenseDto[]>(response);
};

export const createExpenseCategory = async (payload: CreateExpenseCategoryDto): Promise<ExpenseCategoryDto> => {
	const response = await api(PATH, {
		method: "POST",
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	return readEnvelopeData<ExpenseCategoryDto>(response);
};

export const updateExpenseCategory = async (id: number, payload: UpdateExpenseCategoryDto): Promise<ExpenseCategoryDto> => {
	const response = await api(`${PATH}/${id}`, {
		method: "PUT",
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	return readEnvelopeData<ExpenseCategoryDto>(response);
};

export const deleteExpenseCategory = async (id: number): Promise<void> => {
	const response = await api(`${PATH}/${id}`, { method: "DELETE" });
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
};
