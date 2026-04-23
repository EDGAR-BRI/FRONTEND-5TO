import {api} from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type { ExchangeRate } from "./exchange_rate.interface";

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