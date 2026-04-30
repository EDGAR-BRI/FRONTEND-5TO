import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "@/lib/services/_shared/envelope";
import type { PatientInfo } from "@/lib/services/medical/info-patient/info_patient.interface"

const BASE_PATH = "medical/info-patient"
export const addPatientInfo = async (payload: PatientInfo): Promise<PatientInfo> => {
    if (!payload.patientId) throw new Error("patientId is required");
    const response = await api(`${BASE_PATH}/patient/${payload.patientId}`, { 
        method: "POST",
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<PatientInfo>(response);
};