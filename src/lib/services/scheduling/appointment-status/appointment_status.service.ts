import {api} from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type { AppointmentStatus } from "./appointment_type.interface";

const BASE_PATH = "scheduling/status-appointment";
export const getAppointmentStatuses = async (): Promise<AppointmentStatus[]> => {
    const response = await api(`${BASE_PATH}`, {
        method: "GET"
    });
    if(!response.ok){
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<AppointmentStatus[]>(response);
}
