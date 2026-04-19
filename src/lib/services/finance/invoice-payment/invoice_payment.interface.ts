export type PaymentAcumulators =
    {
        paymentMethod: {
            id: number, name: string, type: string, currency: string, is_active: boolean
        },
        amount_paid: number // en dolaritoss
    }