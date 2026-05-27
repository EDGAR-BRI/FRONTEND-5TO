import {api} from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type {CreateInvoicePaymentDto, InvoicePayment, PaymentAcumulators} from "./invoice_payment.interface";

const BASE_PATH = "/finance/invoice-payment";
export const getPaymentsBreakdown = async (): Promise<PaymentAcumulators[]> => {
    const response = await api("/report/receptionist-overview", {
        method: "GET"
    });
    if(!response.ok){
		throw new Error(await readEnvelopeErrorMessage(response));
	}
    const overview = await readEnvelopeData<{ paymentBreakdown: PaymentAcumulators[] }>(response);
    return overview.paymentBreakdown;
}
export const getInvoicePayments = async (): Promise<InvoicePayment[]> => {
    const response = await api(BASE_PATH, {
        method: "GET"
    });
    if(!response.ok){
		throw new Error(await readEnvelopeErrorMessage(response));
	}
    return readEnvelopeData<InvoicePayment[]>(response);
}
export const addInvoicePayment = async (payload: CreateInvoicePaymentDto): Promise<InvoicePayment> => {
    if (!payload.invoiceId) throw new Error("invoiceId is required");
    const response = await api(BASE_PATH, { 
        method: "POST",
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<InvoicePayment>(response);
};
