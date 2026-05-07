import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "@/lib/services/_shared/envelope";
import type { Patient, createPatientRequest, PatientPagination, UpdateContactInfoRequest } from "./patient.interface";

const BASE_PATH = "medical/patient";

export const getPatients = async (params?: { ci?: string; name?: string; page?: number; limit?: number }): Promise<{ data: Patient[]; pagination?: PatientPagination }> => {
    const queryParams = new URLSearchParams();
    if (params?.ci) queryParams.append('ci', params.ci);
    if (params?.name) queryParams.append('name', params.name);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const response = await api(`${BASE_PATH}${queryString ? '?' + queryString : ''}`, { method: "GET" });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    
    const result = await response.json();
    return {
        data: result.data,
        pagination: result.pagination
    };
};

export const getPatientsFromUser = async (userId: number): Promise<Patient[]> => {
    const response = await api(`${BASE_PATH}/user/${userId}`, { method: "GET" });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Patient[]>(response);
};

export const getPatientById = async (id: number): Promise<Patient> => {
    const response = await api(`${BASE_PATH}/${id}`, { method: "GET" });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Patient>(response);
};

export const getPatientByCI = async (ci: string): Promise<Patient> => {
    const response = await api(`${BASE_PATH}/ci/${ci}`, { method: "GET" });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Patient>(response);
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

export const updatePatient = async (id: number, payload: Partial<createPatientRequest>): Promise<Patient> => {
    const response = await api(`${BASE_PATH}/${id}`, { 
        method: "PUT",
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Patient>(response);
};

export const deletePatient = async (id: number): Promise<Patient> => {
    const response = await api(`${BASE_PATH}/${id}`, { method: "DELETE" });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Patient>(response);
};