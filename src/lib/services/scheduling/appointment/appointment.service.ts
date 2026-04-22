import {api} from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type { AppointmentsOverview, Appointment } from "./appointment.interface";

const BASE_PATH = "scheduling/appointment";

export const getScheduleOverview = async (): Promise<AppointmentsOverview[]> => {
    const response = await api(BASE_PATH, { //  CAMBIAR POR LA QUE IMPLEMENTE SAMUEL CON LOS WHERE NECESARIOS
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