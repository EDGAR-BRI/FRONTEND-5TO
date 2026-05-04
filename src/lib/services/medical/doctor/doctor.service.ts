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

export const getDoctorById = async (id: number): Promise<DoctorDetail> => {
    const response = await api(`${BASE_PATH}/${id}`, {
        method: "GET"
    });
    if(!response.ok){
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<DoctorDetail>(response);
}
