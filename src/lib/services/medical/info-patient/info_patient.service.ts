import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "@/lib/services/_shared/envelope";
import type { PatientInfo } from "@/lib/services/medical/info-patient/info_patient.interface"

const BASE_PATH = ""
export const addPatientInfo = async (payload: PatientInfo): Promise<PatientInfo> => {
    const response = await api(BASE_PATH, { 
        method: "GET",
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<PatientInfo>(response);
};