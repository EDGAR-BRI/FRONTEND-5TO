export type ExpensePaymentExchangeRate = {
    id: number;
    rate: number;
    createdAt: string;
    is_active: boolean;
};

export type ExpensePaymentMethod = {
    id: number;
    name: string;
    type: string;
    currency: string;
    is_active?: boolean;
};

export type ExpensePaymentSupplier = {
    id: number;
    name: string;
    contact: string | null;
    phone: string | null;
};

export type ExpenseInvoiceSummary = {
    id: number;
    categoryId: number;
    supplierId: number | null;
    exchangeRateId?: number | null;
    total_amount: number;
    date_at: string;
    category: {
        id: number;
        name: string;
    };
    supplier: ExpensePaymentSupplier | null;
};

export type ExpensePaymentRecord = {
    id: number;
    invoiceExpenseId: number;
    paymentMethodId: number;
    amount: number;
    exchangeRateId?: number | null;
    date_at?: string | null;
    paymentMethod: ExpensePaymentMethod;
    exchangeRate: ExpensePaymentExchangeRate | null;
    invoiceExpense: ExpenseInvoiceSummary;
};

export type CreateExpensePaymentPayload = {
    invoiceExpenseId: number;
    paymentMethodId: number;
    amount: number;
    exchangeRateId?: number;
    date_at?: string;
};

export type CreatedExpensePayment = {
    id: number;
};
