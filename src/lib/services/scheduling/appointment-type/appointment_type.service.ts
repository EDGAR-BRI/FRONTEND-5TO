import {api} from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type { AppointmentType } from "@/lib/services/scheduling/appointment-type/appointment_type.interface"

const BASE_PATH = "scheduling/appointment-type"
export const getAppointmentTypes = async (): Promise<AppointmentType[]> => {
    const response = await api(`${BASE_PATH}`, { //  CAMBIAR POR LA QUE IMPLEMENTE SAMUEL CON LOS WHERE NECESARIOS
        method: "GET"
    });
    if(!response.ok){
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<AppointmentType[]>(response);
}