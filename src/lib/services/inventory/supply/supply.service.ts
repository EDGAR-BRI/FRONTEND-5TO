import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../../_shared/envelope";
import type { Supply } from "./supply.interface";

const BASE_PATH = "inventory/supply";

export const getSupplies = async (search?: string): Promise<Supply[]> => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const endpoint = params.toString() ? `${BASE_PATH}?${params.toString()}` : BASE_PATH;

    const response = await api(endpoint, { method: "GET" });
    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }
    return readEnvelopeData<Supply[]>(response);
};
