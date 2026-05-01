import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../../_shared/envelope";
import type {
    ConsultationDiagnosisDto,
    CreateConsultationDiagnosisDto,
    UpdateConsultationDiagnosisDto,
} from "./consultation-diagnosis.interface";

const getBasePath = (consultationId: number) => `medical/consultation/${consultationId}/consultation-diagnoses`;

export const listConsultationDiagnoses = async (consultationId: number): Promise<ConsultationDiagnosisDto[]> => {
    const response = await api(getBasePath(consultationId), { method: "GET" });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<ConsultationDiagnosisDto[]>(response);
};

export const createConsultationDiagnosis = async (
    consultationId: number,
    payload: CreateConsultationDiagnosisDto
): Promise<ConsultationDiagnosisDto> => {
    const response = await api(getBasePath(consultationId), {
        method: "POST",
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<ConsultationDiagnosisDto>(response);
};

export const updateConsultationDiagnosis = async (
    consultationId: number,
    consultationDiagnosisId: number,
    payload: UpdateConsultationDiagnosisDto
): Promise<ConsultationDiagnosisDto> => {
    const response = await api(`${getBasePath(consultationId)}/${consultationDiagnosisId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<ConsultationDiagnosisDto>(response);
};

export const deleteConsultationDiagnosis = async (
    consultationId: number,
    consultationDiagnosisId: number
): Promise<ConsultationDiagnosisDto> => {
    const response = await api(`${getBasePath(consultationId)}/${consultationDiagnosisId}`, { method: "DELETE" });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<ConsultationDiagnosisDto>(response);
};
