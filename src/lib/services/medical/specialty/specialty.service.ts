import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type { Specialty, SpecialtySelectOptions } from "./specialty.interface";

const BASE_PATH = "medical/specialty";

export const getSpecialties = async (): Promise<Specialty[]> => {
    const response = await api(BASE_PATH, {
        method: "GET"
    });
    if(!response.ok){
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Specialty[]>(response);
}
export const getSpecialtyById = async (id:number): Promise<Specialty> => {
    const response = await api(`${BASE_PATH}/${id}`, {
        method: "GET"
    });
    if(!response.ok){
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Specialty>(response);
}
export const getSpecialtiesSelect = async (): Promise<SpecialtySelectOptions[]> => {
    const response = await api(BASE_PATH, {
        method: "GET"
    });
    if(!response.ok){
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<SpecialtySelectOptions[]>(response);
}
