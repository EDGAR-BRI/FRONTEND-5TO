import {api} from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type { AppointmentsOverview, Appointment } from "./appointment.interface";

const BASE_PATH = "scheduling/appointment";

export const getScheduleOverview = async (filters?: { range?: string }): Promise<AppointmentsOverview[]> => {
    const params = new URLSearchParams();
    if (filters?.range) params.set("range", filters.range);
    const endpoint = params.toString() ? `${BASE_PATH}?${params.toString()}` : BASE_PATH;

    const response = await api(endpoint, { //  CAMBIAR POR LA QUE IMPLEMENTE SAMUEL CON LOS WHERE NECESARIOS
        method: "GET"
    });
    if(!response.ok){
		throw new Error(await readEnvelopeErrorMessage(response));
	}
    return readEnvelopeData<AppointmentsOverview[]>(response);
}
export const getAppointmentsByDr = async (doctorId: number): Promise<Appointment[]> => {
    const response = await api(`${BASE_PATH}/doctor/${doctorId}`, { //  CAMBIAR POR LA QUE IMPLEMENTE SAMUEL CON LOS WHERE NECESARIOS
        method: "GET"
    });
    if(!response.ok){
		throw new Error(await readEnvelopeErrorMessage(response));
	}
    return readEnvelopeData<Appointment[]>(response);
}