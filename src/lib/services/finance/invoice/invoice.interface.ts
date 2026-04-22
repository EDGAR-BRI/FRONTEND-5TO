export type Invoice = {
    id: number,
    patientId: number,
    receptionistId: number,
    exchangeRateId: number,
    total_usd: number,
    statusId: number,
    taxId: number,
    status: {
        id: number, name: string, color_hex: boolean
    },
    exchangeRate: {
        id: number, rate: string, createdAt: string, is_active: boolean
    },
    tax: {
        id: number, name: string, rate: string, code: string, isActive: boolean
    },
    patient: {
        id: number,
        user: { id: number, ci: string, name: string }
    },
    receptionist: {
        id: number, ci: string, name: string
    },
    payments: {
        id: number,
        paymentMethodId: number,
        currencyId: number,
        amount_paid: number,
        igtf_amount: number,
        exchangeRateId: number,
        paymentMethod: {
            id: number, name: string, type: string, currency: string, is_active: boolean
        },
        exchangeRate: {
            id: number, rate: string, createdAt: string, is_active: boolean
        },
    },
}
