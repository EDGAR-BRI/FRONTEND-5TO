import {api} from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type { DashboardSchedule } from "./appointment.interface";

const BASE_PATH = "scheduling/appointment";

export const getScheduleOverview = async (): Promise<DashboardSchedule[]> => {
    const response = await api(BASE_PATH, { //  CAMBIAR POR LA QUE IMPLEMENTE SAMUEL CON LOS WHERE NECESARIOS
        method: "GET"
    });
    if(!response.ok){
		throw new Error(await readEnvelopeErrorMessage(response));
	}
    return readEnvelopeData<DashboardSchedule[]>(response);
}
