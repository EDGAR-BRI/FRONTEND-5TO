import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../../_shared/envelope";
import type {
    ClinicalExaminationDto,
    CreateClinicalExaminationDto,
    UpdateClinicalExaminationDto,
} from "./clinical-examination.interface";

const getBasePath = (consultationId: number) => `medical/consultation/${consultationId}/clinical-examinations`;

export const listClinicalExaminations = async (consultationId: number): Promise<ClinicalExaminationDto[]> => {
    const response = await api(getBasePath(consultationId), { method: "GET" });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<ClinicalExaminationDto[]>(response);
};

export const createClinicalExamination = async (
    consultationId: number,
    payload: CreateClinicalExaminationDto
): Promise<ClinicalExaminationDto> => {
    const response = await api(getBasePath(consultationId), {
        method: "POST",
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<ClinicalExaminationDto>(response);
};

export const updateClinicalExamination = async (
    consultationId: number,
    clinicalExaminationId: number,
    payload: UpdateClinicalExaminationDto
): Promise<ClinicalExaminationDto> => {
    const response = await api(`${getBasePath(consultationId)}/${clinicalExaminationId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<ClinicalExaminationDto>(response);
};

export const deleteClinicalExamination = async (
    consultationId: number,
    clinicalExaminationId: number
): Promise<ClinicalExaminationDto> => {
    const response = await api(`${getBasePath(consultationId)}/${clinicalExaminationId}`, { method: "DELETE" });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<ClinicalExaminationDto>(response);
};
