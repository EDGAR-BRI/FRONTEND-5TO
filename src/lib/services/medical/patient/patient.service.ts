import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "@/lib/services/_shared/envelope";
import type { Patient, createPatientRequest } from "./patient.interface";

const BASE_PATH = "medical/patient";
export const getPatients = async (): Promise<Patient[]> => {
    const response = await api(BASE_PATH, { method: "GET" });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Patient[]>(response);
};
export const addPatient = async (payload: createPatientRequest): Promise<Patient> => {
    const response = await api(BASE_PATH, { 
        method: "GET",
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Patient>(response);
};