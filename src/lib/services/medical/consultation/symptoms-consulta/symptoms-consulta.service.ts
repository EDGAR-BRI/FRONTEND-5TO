import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../../_shared/envelope";
import type {
    SymptomsConsultaDto,
    CreateSymptomsConsultaDto,
    UpdateSymptomsConsultaDto,
} from "./symptoms-consulta.interface";

const getBasePath = (consultationId: number) => `medical/consultation/${consultationId}/symptoms-consultas`;

export const listSymptomsConsultas = async (consultationId: number): Promise<SymptomsConsultaDto[]> => {
    const response = await api(getBasePath(consultationId), { method: "GET" });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<SymptomsConsultaDto[]>(response);
};

export const createSymptomsConsulta = async (
    consultationId: number,
    payload: CreateSymptomsConsultaDto
): Promise<SymptomsConsultaDto> => {
    const response = await api(getBasePath(consultationId), {
        method: "POST",
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<SymptomsConsultaDto>(response);
};

export const updateSymptomsConsulta = async (
    consultationId: number,
    symptomsConsultaId: number,
    payload: UpdateSymptomsConsultaDto
): Promise<SymptomsConsultaDto> => {
    const response = await api(`${getBasePath(consultationId)}/${symptomsConsultaId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<SymptomsConsultaDto>(response);
};

export const deleteSymptomsConsulta = async (
    consultationId: number,
    symptomsConsultaId: number
): Promise<SymptomsConsultaDto> => {
    const response = await api(`${getBasePath(consultationId)}/${symptomsConsultaId}`, { method: "DELETE" });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<SymptomsConsultaDto>(response);
};
