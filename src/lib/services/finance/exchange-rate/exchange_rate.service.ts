import {api} from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type { CreateExchangeRateDto, ExchangeRate, UpdateExchangeRateDto } from "./exchange_rate.interface";

export type { ExchangeRate } from "./exchange_rate.interface";

const BASE_PATH = "finance/exchange-rate";
export const getExchangeRates = async (): Promise<ExchangeRate[]> => {
    const response = await api(BASE_PATH, {
        method: "GET"
    });
    if(!response.ok){
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<ExchangeRate[]>(response);
}

export const createExchangeRate = async (payload: CreateExchangeRateDto): Promise<ExchangeRate> => {
    const response = await api(BASE_PATH, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<ExchangeRate>(response);
};

export const updateExchangeRate = async (id: number, payload: UpdateExchangeRateDto): Promise<ExchangeRate> => {
    const response = await api(`${BASE_PATH}/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<ExchangeRate>(response);
};

export const deleteExchangeRate = async (id: number): Promise<ExchangeRate> => {
    const response = await api(`${BASE_PATH}/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<ExchangeRate>(response);
};
