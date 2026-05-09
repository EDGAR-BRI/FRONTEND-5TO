import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "@/lib/services/_shared/envelope";
import type { Patient, createPatientRequest, createPatientReceptionRequest } from "./patient.interface";

const BASE_PATH = "medical/patient";
export const getPatients = async (): Promise<Patient[]> => {
    const response = await api(BASE_PATH, { method: "GET" });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Patient[]>(response);
};
export const getPatientsFromUser = async (userId: number): Promise<Patient[]> => {
    const response = await api(`${BASE_PATH}/user/${userId}`, { method: "GET" });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Patient[]>(response);
};
export const addPatient = async (payload: createPatientRequest): Promise<Patient> => {
    const response = await api(BASE_PATH, { 
        method: "POST",
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Patient>(response);
};

export const addPatientFromReception = async (payload: createPatientReceptionRequest): Promise<Patient> => {
    const response = await api(`${BASE_PATH}/reception`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Patient>(response);
};