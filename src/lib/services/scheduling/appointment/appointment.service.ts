import {api} from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type { AppointmentsOverview, Appointment, CreateAppointmentDto, UpdateAppointmentDto } from "./appointment.interface";

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
export const getAppointments = async (filters?: { range?: string, statusId?: number }): Promise<AppointmentsOverview[]> => {
    const params = new URLSearchParams();
    if (filters?.range) params.set("range", filters.range);
    if (filters?.statusId) {console.log("enrando"); params.set("statusId", String(filters.statusId));}
    const endpoint = params.toString() ? `${BASE_PATH}?${params.toString()}` : BASE_PATH;

    const response = await api(endpoint, {
        method: "GET"
    });
    if(!response.ok){
		throw new Error(await readEnvelopeErrorMessage(response));
	}
    return readEnvelopeData<AppointmentsOverview[]>(response);
}
import type { AstroCookies } from "astro";

export const getAppointmentsByDr = async (doctorId: number, selectUpcomingOnly: boolean = false, cookies?: AstroCookies): Promise<Appointment[]> => {
    const url = `${BASE_PATH}/${selectUpcomingOnly ? 'upcoming/' : ''}doctor/${doctorId}`
    const response = await api(url, { 
        method: "GET"
    }, cookies);
    if(!response.ok){
		throw new Error(await readEnvelopeErrorMessage(response));
	}
    return readEnvelopeData<Appointment[]>(response);
}
export const createAppointment = async (payload: CreateAppointmentDto): Promise<Appointment> => {
    const response = await api(BASE_PATH, { 
        method: "POST",
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Appointment>(response);
};

export const updateAppointment = async (id: number, payload: UpdateAppointmentDto): Promise<Appointment> => {
    const response = await api(`${BASE_PATH}/${id}`, { 
        method: "PUT",
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Appointment>(response);
};