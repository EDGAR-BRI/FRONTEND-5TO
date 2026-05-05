import {api} from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type { Invoice, createInvoiceDto } from "./invoice.interface";

const BASE_PATH = "finance/invoice"
export const getInvoices = async (): Promise<Invoice[]> => {
    const response = await api(BASE_PATH, { // CAMBIAR POR LA QUE IMPLEMENTE SAMUEL CON LOS WHERE NECESARIOS
        method: "GET"
    });
    if(!response.ok){
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Invoice[]>(response);
}
export const addInvoice = async (payload: createInvoiceDto): Promise<Invoice> => {
    if (!payload.patientId) throw new Error("patientId is required");
    const response = await api(BASE_PATH, { 
        method: "POST",
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Invoice>(response);
};