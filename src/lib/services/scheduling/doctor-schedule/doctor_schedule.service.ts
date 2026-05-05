import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type { CreateDoctorScheduleDto, DoctorSchedule, selectActuallyAvailableDrs, UpdateDoctorScheduleDto } from "./doctor_schedule.interface";
import type { DoctorSchedConfigOption } from "@/lib/services/medical/doctor/doctor.interface";

const BASE_PATH = "scheduling/doctor-schedule";

export const getDoctorSchedules = async (doctorId: number): Promise<DoctorSchedule[]> => {
    const response = await api(`${BASE_PATH}?doctorId=${doctorId}`, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }

    return readEnvelopeData<DoctorSchedule[]>(response);
};
export const getActuallyAvailableDrs = async (doctorOnly: boolean = false): Promise<DoctorSchedConfigOption[]> => {
    const url = `${BASE_PATH}${doctorOnly ? '/available-doctors' : ''}` 
    const response = await api(`${url}?periodEnd=N/A`, { 
        method: "GET"
    });
    if(!response.ok){
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
