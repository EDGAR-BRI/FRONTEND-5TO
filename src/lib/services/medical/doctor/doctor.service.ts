import {api} from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type { DoctorSchedConfigOption, DoctorDetail } from "./doctor.interface";

const BASE_PATH = "medical/doctor";

export const getDrsSelect = async (): Promise<DoctorSchedConfigOption[]> => {
    const response = await api(BASE_PATH, {
        method: "GET"
    });
    if(!response.ok){
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<DoctorSchedConfigOption[]>(response);
}

export const getActuallyAvailableDrs = async (): Promise<DoctorSchedConfigOption[]> => {
    const response = await api(BASE_PATH, { //  CAMBIAR POR LA QUE IMPLEMENTE SAMUEL CON LOS WHERE NECESARIOS
        method: "GET"
    });
    if(!response.ok){
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<DoctorSchedConfigOption[]>(response);
}

export const getDoctorById = async (id: number): Promise<DoctorDetail | null> => {
    try {
        const response = await api(`${BASE_PATH}/${id}`, {
            method: "GET"
        });
        if(!response.ok){
            console.error("Error fetching doctor:", response.status, await response.text());
            return null;
        }
        const data = await readEnvelopeData<DoctorDetail>(response);
        console.log("Doctor data response:", data);
        return data;
    } catch (error) {
        console.error("Error in getDoctorById:", error);
        return null;
    }
}

export const getDoctorByUserId = async (userId: number): Promise<DoctorDetail | null> => {
    try {
        const response = await api(`${BASE_PATH}/by-user/${userId}`, {
            method: "GET"
        });
        if(!response.ok){
            console.error("Error fetching doctor by userId:", response.status);
            return null;
        }
        const data = await readEnvelopeData<DoctorDetail>(response);
        return data;
    } catch (error) {
        console.error("Error in getDoctorByUserId:", error);
        return null;
    }
}
