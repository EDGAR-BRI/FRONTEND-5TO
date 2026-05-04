import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "@/lib/services/_shared/envelope";
import type { CreatePurchasePayload, CreatedPurchase } from "./purchase.interface";

const BASE_PATH = "procurement/purchase";

export const createPurchase = async (payload: CreatePurchasePayload): Promise<CreatedPurchase> => {
    const response = await api(BASE_PATH, {
        method: "POST",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }

    return readEnvelopeData<CreatedPurchase>(response);
};
