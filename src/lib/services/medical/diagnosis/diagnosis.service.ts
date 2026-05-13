import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type { CreateDiagnosisDto, Diagnosis, UpdateDiagnosisDto } from "./diagnosis.interface";

export type { Diagnosis } from "./diagnosis.interface";

const BASE_PATH = "medical/diagnosis";

export const getDiagnoses = async (search?: string): Promise<Diagnosis[]> => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const endpoint = params.toString() ? `${BASE_PATH}?${params.toString()}` : BASE_PATH;

    const response = await api(endpoint, { method: "GET" });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Diagnosis[]>(response);
};

export const createDiagnosis = async (payload: CreateDiagnosisDto): Promise<Diagnosis> => {
    const response = await api(BASE_PATH, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Diagnosis>(response);
};

export const updateDiagnosis = async (id: number, payload: UpdateDiagnosisDto): Promise<Diagnosis> => {
    const response = await api(`${BASE_PATH}/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Diagnosis>(response);
};

export const deleteDiagnosis = async (id: number): Promise<Diagnosis> => {
    const response = await api(`${BASE_PATH}/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Diagnosis>(response);
};
