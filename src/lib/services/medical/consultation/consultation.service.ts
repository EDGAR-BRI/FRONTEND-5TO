import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type {
	ConsultationDetail,
	ConsultationSummary,
	CreateConsultationDto,
	FinishConsultationDto,
	UpdateConsultationDto,
} from "./consultation.interface";

const BASE_PATH = "medical/consultation";

export const listConsultations = async (): Promise<ConsultationSummary[]> => {
	const response = await api(BASE_PATH, { method: "GET" });
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	return readEnvelopeData<ConsultationSummary[]>(response);
};

export const listConsultationsByDoctor = async (doctorId: number): Promise<ConsultationSummary[]> => {
	const response = await api(`${BASE_PATH}/doctor/${doctorId}`, { method: "GET" });
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	return readEnvelopeData<ConsultationSummary[]>(response);
};

export const getConsultationById = async (id: number): Promise<ConsultationDetail> => {
	const response = await api(`${BASE_PATH}/${id}`, { method: "GET" });
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	return readEnvelopeData<ConsultationDetail>(response);
};

export const createConsultation = async (payload: CreateConsultationDto): Promise<ConsultationSummary> => {
	const response = await api(BASE_PATH, {
		method: "POST",
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	return readEnvelopeData<ConsultationSummary>(response);
};

export const updateConsultation = async (
	id: number,
	payload: UpdateConsultationDto
): Promise<ConsultationSummary> => {
	const response = await api(`${BASE_PATH}/${id}`, {
		method: "PUT",
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	return readEnvelopeData<ConsultationSummary>(response);
};

export const finishConsultation = async (
	id: number,
	payload: FinishConsultationDto
): Promise<ConsultationSummary> => {
	const response = await api(`${BASE_PATH}/${id}/finish`, {
		method: "PUT",
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	return readEnvelopeData<ConsultationSummary>(response);
};

export const deleteConsultation = async (id: number): Promise<ConsultationSummary> => {
	const response = await api(`${BASE_PATH}/${id}`, { method: "DELETE" });
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	return readEnvelopeData<ConsultationSummary>(response);
};
