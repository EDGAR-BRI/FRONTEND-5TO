import {api} from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type { PaymentMethod } from "./payment_method.interface";

const BASE_PATH = "finance/payment-method";
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
    const response = await api(BASE_PATH, { // CAMBIAR POR LA QUE IMPLEMENTE SAMUEL CON LOS WHERE NECESARIOS
        method: "GET"
    });
    if(!response.ok){
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<PaymentMethod[]>(response);
}