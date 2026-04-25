import {api} from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type { DoctorAvailability, CreateDoctorAvailabilityDto } from "./doctor_availability.interface"

const BASE_PATH = "scheduling/doctor-availability"

type ApiDoctorAvailability = {
    id: number;
    doctorScheduleId: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    patient_limit: number;
    doctorSchedule?: { doctorId: number };
}

const normalizeAvailability = (a: ApiDoctorAvailability): DoctorAvailability => ({
    id: a.id,
    doctorId: a.doctorSchedule?.doctorId ?? 0,
    doctorScheduleId: a.doctorScheduleId,
    day_of_week: a.day_of_week,
    start_time: a.start_time,
    end_time: a.end_time,
    patient_limit: a.patient_limit,
});

export const getDoctorAvailabilitiesByDoctorId = async (doctorId: number): Promise<DoctorAvailability[]> => {
    const response = await api(`${BASE_PATH}?doctorId=${doctorId}`, {
        method: "GET"
    });
    if(!response.ok){
		throw new Error(await readEnvelopeErrorMessage(response));
	}
    const data = await readEnvelopeData<ApiDoctorAvailability[]>(response);
    return data.map(normalizeAvailability);
}

export const getDoctorAvailabilitiesByScheduleId = async (doctorScheduleId: number): Promise<DoctorAvailability[]> => {
    const response = await api(`${BASE_PATH}?doctorScheduleId=${doctorScheduleId}`, {
        method: "GET"
    });
    if(!response.ok){
		throw new Error(await readEnvelopeErrorMessage(response));
	}
    const data = await readEnvelopeData<ApiDoctorAvailability[]>(response);
    return data.map(normalizeAvailability);
}

// Backwards compatible alias (antes recibía doctorId y llamaba /:id)
export const getDoctorAvailability = async (doctorId: number): Promise<DoctorAvailability[]> => {
    return getDoctorAvailabilitiesByDoctorId(doctorId);
}
export const getDoctorsAvailabilities = async (): Promise<DoctorAvailability[]> => {
    const response = await api(`${BASE_PATH}`, { //  CAMBIAR POR LA QUE IMPLEMENTE SAMUEL CON LOS WHERE NECESARIOS
        method: "GET"
    });
    if(!response.ok){
		throw new Error(await readEnvelopeErrorMessage(response));
	}
    const data = await readEnvelopeData<ApiDoctorAvailability[]>(response);
    return data.map(normalizeAvailability);
}
export const createDrAvailability = async (payload: CreateDoctorAvailabilityDto): Promise<DoctorAvailability> => {
    const response = await api(BASE_PATH, { 
        method: "POST",
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    const data = await readEnvelopeData<ApiDoctorAvailability>(response);
    return normalizeAvailability(data);
};