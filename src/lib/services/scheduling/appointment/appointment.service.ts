import {api} from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type { DashboardSchedule, PaymentAcumulators } from "./appointment.interface";

//const BASE_PATH = "";

export const getScheduleOverview = async (): Promise<DashboardSchedule[]> => {
    const response = await api("scheduling/appointment", { //  CAMBIAR POR LA QUE IMPLEMENTE SAMUEL CON LOS WHERE NECESARIOS
        method: "GET"
    });
    if(!response.ok){
		throw new Error(await readEnvelopeErrorMessage(response));
	}
    return readEnvelopeData<DashboardSchedule[]>(response);
}
export const getPaymentsOverview = async (): Promise<PaymentAcumulators[]> => {
    const response = await api("finance/invoice-payment", { // CAMBIAR POR LA QUE IMPLEMENTE SAMUEL CON LOS WHERE NECESARIOS
        method: "GET"
    });
    if(!response.ok){
		throw new Error(await readEnvelopeErrorMessage(response));
	}
    return readEnvelopeData<PaymentAcumulators[]>(response);
}