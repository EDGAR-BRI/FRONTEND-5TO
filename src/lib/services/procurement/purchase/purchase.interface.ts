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

export type PurchaseSupplier = {
    id: number;
    name: string;
    contact: string | null;
    phone: string | null;
};

export type PurchaseUser = {
    id: number;
    ci: string;
    name: string;
    roleId: number;
    active: boolean;
};

export type PurchaseExchangeRate = {
    id: number;
    rate: number;
    createdAt: string;
    is_active: boolean;
};

export type PurchaseItem = {
    id: number;
    purchaseId: number;
    supplyId: number;
    quantity: number;
    unit_cost: number;
    expiration_date: string | null;
    supply: {
        id: number;
        name: string;
        sku: string | null;
        active: boolean;
        cost_price: number | null;
    };
};

export type PurchasePayment = {
    id: number;
    purchaseId: number;
    paymentMethodId: number;
    amount: number;
    currency: string;
    reference: string | null;
    payment_date: string | null;
    paymentMethod: {
        id: number;
        name: string;
        type: string;
        currency: string;
        is_active: boolean;
    };
};

export type PurchaseHistoryRecord = {
    id: number;
    supplierId: number;
    userId: number;
    status: PurchaseStatus;
    exchangeRateId: number | null;
    reference: string | null;
    observation: string | null;
    date: string;
    supplier: PurchaseSupplier;
    user: PurchaseUser;
    exchangeRate: PurchaseExchangeRate | null;
    items: PurchaseItem[];
    payments: PurchasePayment[];
    total_usd: number;
    total_bs: number;
    iva_rate: number | null;
    iva_usd: number;
    iva_bs: number;
};
