import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type { Symptom } from "./symptoms.interface";

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
