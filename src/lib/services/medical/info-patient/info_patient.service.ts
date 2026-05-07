import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "@/lib/services/_shared/envelope";
import type { PatientInfo, UpdateContactInfoPayload } from "@/lib/services/medical/info-patient/info_patient.interface"

const BASE_PATH = "medical/info-patient"

export const getPatientInfo = async (patientId: number): Promise<PatientInfo> => {
    const response = await api(`${BASE_PATH}/patient/${patientId}`, { method: "GET" });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<PatientInfo>(response);
};

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

export const updatePatientContactInfo = async (patientId: number, payload: UpdateContactInfoPayload): Promise<PatientInfo> => {
    const response = await api(`${BASE_PATH}/patient/${patientId}/contact`, { 
        method: "PATCH",
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<PatientInfo>(response);
};