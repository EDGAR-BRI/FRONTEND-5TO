import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type { CreateSymptomDto, Symptom, UpdateSymptomDto } from "./symptoms.interface";

export type { Symptom } from "./symptoms.interface";

const BASE_PATH = "medical/symptoms";

export const getSymptoms = async (search?: string): Promise<Symptom[]> => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const endpoint = params.toString() ? `${BASE_PATH}?${params.toString()}` : BASE_PATH;

    const response = await api(endpoint, { method: "GET" });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Symptom[]>(response);
};

export const createSymptom = async (payload: CreateSymptomDto): Promise<Symptom> => {
    const response = await api(BASE_PATH, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Symptom>(response);
};

export const updateSymptom = async (id: number, payload: UpdateSymptomDto): Promise<Symptom> => {
    const response = await api(`${BASE_PATH}/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Symptom>(response);
};

export const deleteSymptom = async (id: number): Promise<Symptom> => {
    const response = await api(`${BASE_PATH}/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Symptom>(response);
};
