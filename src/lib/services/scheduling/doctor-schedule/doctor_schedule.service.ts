import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type { CreateDoctorScheduleDto, DoctorSchedule, UpdateDoctorScheduleDto } from "./doctor_schedule.interface";
import type { DoctorSchedConfigOption } from "@/lib/services/medical/doctor/doctor.interface";

const BASE_PATH = "scheduling/doctor-schedule";

export const getDoctorSchedules = async (doctorId: number, periodEnd?: string, rangeStart?: string, rangeEnd?: string): Promise<DoctorSchedule[]> => {
    const params = new URLSearchParams();
    params.append('doctorId', String(doctorId));
    if (periodEnd !== undefined && periodEnd !== null) params.append('periodEnd', periodEnd);
    if (rangeStart) params.append('rangeStart', rangeStart);
    if (rangeEnd) params.append('rangeEnd', rangeEnd);
    
    const queryString = params.toString();
    const url = queryString ? `${BASE_PATH}?${queryString}` : BASE_PATH;
    const response = await api(url, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }

    return readEnvelopeData<DoctorSchedule[]>(response);
};
export const getDoctorsBySchedule = async (periodEnd?: string, rangeStart?: string, rangeEnd?: string): Promise<DoctorSchedConfigOption[]> => {
    const params = new URLSearchParams();
    
    if (periodEnd !== undefined && periodEnd !== null) params.append('periodEnd', periodEnd);
    if (rangeStart) params.append('rangeStart', rangeStart);
    if (rangeEnd) params.append('rangeEnd', rangeEnd);
    
    const queryString = params.toString();
    const url = queryString ? `${BASE_PATH}/doctors?${queryString}` : `${BASE_PATH}/doctors`;
    
    const response = await api(url, { 
        method: "GET"
    });
    
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<DoctorSchedConfigOption[]>(response);
}

export const updateDoctorSchedule = async (id: number, payload: UpdateDoctorScheduleDto): Promise<DoctorSchedule[]> => {
    const response = await api(`${BASE_PATH}/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }

    return readEnvelopeData<DoctorSchedule[]>(response);
};

export const createDoctorSchedule = async (payload: CreateDoctorScheduleDto): Promise<DoctorSchedule> => {
    const response = await api(BASE_PATH, {
        method: "POST",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }

    return readEnvelopeData<DoctorSchedule>(response);
};
