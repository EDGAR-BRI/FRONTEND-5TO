import {api} from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type {InvoicePayment, PaymentAcumulators} from "./invoice_payment.interface";

const BASE_PATH = "finance/invoice-payment"
export const getPaymentsBreakdown = async (): Promise<PaymentAcumulators[]> => {
    const response = await api(BASE_PATH, { // CAMBIAR POR LA QUE IMPLEMENTE SAMUEL CON LOS WHERE NECESARIOS
        method: "GET"
    });
    if(!response.ok){
		throw new Error(await readEnvelopeErrorMessage(response));
	}
    return readEnvelopeData<PaymentAcumulators[]>(response);
}
export const getInvoicePayments = async (): Promise<InvoicePayment[]> => {
    const response = await api(BASE_PATH, { // CAMBIAR POR LA QUE IMPLEMENTE SAMUEL CON LOS WHERE NECESARIOS
        method: "GET"
    });
    if(!response.ok){
		throw new Error(await readEnvelopeErrorMessage(response));
	}
    return readEnvelopeData<InvoicePayment[]>(response);
}