export type PaymentAcumulators =
    {
        paymentMethod: {
            id: number, name: string, type: string, currency: string, is_active: boolean
        },
        amount_paid: number // en dolaritoss
    }
export type InvoicePayment =
    {
        id: number,
        invoiceId: number,
        paymentMethodId: number,
        currencyId: number,
        amount_paid: number,
        igtf_amount: number,
        exchangeRateId: number,
        paymentMethod: {
            id: number, name: string, type: string, currency: string, is_active: boolean
        },
        exchangeRate: {
            id: number, rate: number, createdAt: string, is_active: boolean
        },
    }