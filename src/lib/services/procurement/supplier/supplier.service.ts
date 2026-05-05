import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "@/lib/services/_shared/envelope";
import type { Supplier } from "./supplier.interface";

const BASE_PATH = "procurement/supplier";

export const getSuppliers = async (): Promise<Supplier[]> => {
    const response = await api(BASE_PATH, { method: "GET" });

    if (!response.ok) {
        throw new Error(await readEnvelopeErrorMessage(response));
    }

    return readEnvelopeData<Supplier[]>(response);
};
