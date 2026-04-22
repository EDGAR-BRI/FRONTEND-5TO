import {api} from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type { DoctorAvailability } from "./doctor_availability.interface"

const BASE_PATH = "scheduling/doctor-availability"

export const getDoctorAvailability = async (id: number): Promise<DoctorAvailability[]> => {
    const response = await api(`${BASE_PATH}/${id}`, { //  CAMBIAR POR LA QUE IMPLEMENTE SAMUEL CON LOS WHERE NECESARIOS
        method: "GET"
    });
    if(!response.ok){
		throw new Error(await readEnvelopeErrorMessage(response));
	}
    return readEnvelopeData<DoctorAvailability[]>(response);
}
export const getDoctorsAvailabilities = async (): Promise<DoctorAvailability[]> => {
    const response = await api(`${BASE_PATH}`, { //  CAMBIAR POR LA QUE IMPLEMENTE SAMUEL CON LOS WHERE NECESARIOS
        method: "GET"
    });
    if(!response.ok){
		throw new Error(await readEnvelopeErrorMessage(response));
	}
    return readEnvelopeData<DoctorAvailability[]>(response);
}