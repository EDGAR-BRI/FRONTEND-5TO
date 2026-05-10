import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "@/lib/services/_shared/envelope";

export interface MedicalSpecialtyDto {
    id: number;
    name: string;
    consultation_price: string;
    commission_percentage: string;
    active: boolean;
}

export interface CreateMedicalSpecialtyDto {
    name: string;
    consultation_price: number;
    commission_percentage: number;
}

export interface UpdateMedicalSpecialtyDto {
    name?: string;
    consultation_price?: number;
    commission_percentage?: number;
    active?: boolean;
}

const PATH = "medical/specialty";

export const listMedicalSpecialties = async (): Promise<MedicalSpecialtyDto[]> => {
    const response = await api(PATH, { method: "GET" });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<MedicalSpecialtyDto[]>(response);
};

export const getMedicalSpecialty = async (id: number): Promise<MedicalSpecialtyDto> => {
    const response = await api(`${PATH}/${id}`, { method: "GET" });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<MedicalSpecialtyDto>(response);
};

export const createMedicalSpecialty = async (payload: CreateMedicalSpecialtyDto): Promise<MedicalSpecialtyDto> => {
    const response = await api(PATH, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<MedicalSpecialtyDto>(response);
};

export const updateMedicalSpecialty = async (id: number, payload: UpdateMedicalSpecialtyDto): Promise<MedicalSpecialtyDto> => {
    const response = await api(`${PATH}/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<MedicalSpecialtyDto>(response);
};

export const deleteMedicalSpecialty = async (id: number): Promise<void> => {
    const response = await api(`${PATH}/${id}`, { method: "DELETE" });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
};