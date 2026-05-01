export type PurchaseStatus = "PENDING" | "COMPLETED" | "CANCELLED" | "ANULLED";

export type CreatePurchaseItem = {
    supplyId: number;
    quantity: number;
    unit_cost: number;
    expiration_date?: string;
};

export type CreatePurchasePayment = {
    paymentMethodId: number;
    amount: number;
};

export type CreatePurchasePayload = {
    supplierId: number;
    userId: number;
    exchangeRateId?: number;
    status: PurchaseStatus;
    reference?: string;
    observation?: string;
    items: CreatePurchaseItem[];
    payments: CreatePurchasePayment[];
};

export type CreatedPurchase = {
    id: number;
};
