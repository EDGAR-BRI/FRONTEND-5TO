import {api} from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type { DoctorSchedConfigOption } from "./doctor.interface";

const BASE_PATH = "medical/doctor";

export const getDoctorSchedOptions = async (): Promise<DoctorSchedConfigOption[]> => {
    const response = await api(BASE_PATH, { //  CAMBIAR POR LA QUE IMPLEMENTE SAMUEL CON LOS WHERE NECESARIOS
        method: "GET"
    });
    if(!response.ok){
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<DoctorSchedConfigOption[]>(response);
}
