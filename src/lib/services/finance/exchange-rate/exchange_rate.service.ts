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

export type BcvRateResponse = {
    moneda: string;
    fecha: string;
    fecha_iso: string;
    valor: {
        valor_str: string;
        valor_num: number;
    };
};

export type BcvSyncResponse = {
    changed: boolean;
    rate: ExchangeRate | null;
    bcv: BcvRateResponse;
};

export const getBcvRate = async (): Promise<BcvRateResponse> => {
    const response = await api(`${BASE_PATH}/bcv`, {
        method: "GET",
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<BcvRateResponse>(response);
};

export const syncBcvRate = async (): Promise<BcvSyncResponse> => {
    const response = await api(`${BASE_PATH}/bcv/sync`, {
        method: "POST",
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<BcvSyncResponse>(response);
};

export const deleteExchangeRate = async (id: number): Promise<ExchangeRate> => {
    const response = await api(`${BASE_PATH}/${id}`, {
        method: "PUT",
    });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<ExchangeRate>(response);
};
