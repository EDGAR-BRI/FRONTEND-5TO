import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "@/lib/services/_shared/envelope";
import type { ExpensePaymentRecord, CreateExpensePaymentPayload, CreatedExpensePayment } from "./expensePayment.interface";

const BASE_PATH = "expenses/expense-payment";

export const listExpensePayments = async (): Promise<ExpensePaymentRecord[]> => {
    const response = await api(BASE_PATH, { method: "GET" });

    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }

    return readEnvelopeData<ExpensePaymentRecord[]>(response);
};

export const createExpensePayment = async (payload: CreateExpensePaymentPayload): Promise<CreatedExpensePayment> => {
    const response = await api(BASE_PATH, { method: "POST", body: JSON.stringify(payload) });

    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }

    return readEnvelopeData<CreatedExpensePayment>(response);
};
