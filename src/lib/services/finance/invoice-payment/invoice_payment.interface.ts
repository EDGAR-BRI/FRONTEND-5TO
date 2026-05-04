export type PaymentAcumulators =
    {
        paymentMethod: {
            id: number, name: string, type: string, currency: string, is_active: boolean
        },
        amount_paid: number // en dolaritoss
    }
export type CreateInvoicePaymentDto = {
    invoiceId: number;
    paymentMethodId: number;
    amount_paid: string | number;
    exchangeRateId?: number;
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
        date_at?: string | null,
        paymentMethod: {
            id: number, name: string, type: string, currency: string, is_active: boolean
        },
        exchangeRate: {
            id: number, rate: number, createdAt: string, is_active: boolean
        },
        invoice: {
            id: number,
            patientId: number,
            receptionistId: number,
            exchangeRateId: number,
            total_usd: number,
            statusId: number,
            taxId: number,
            date_at: string,
            status: {
                id: number, name: string, color_hex: boolean
            },
            patient: {
                id: number,
                ci?: string | null,
                name?: string | null,
                user?: { id: number, ci: string, name: string } | null
            },
            receptionist: {
                id: number, ci: string, name: string
            },
            consultation?: {
                id: number,
                doctor: {
                    id: number,
                    user: { id: number, ci: string, name: string }
                }
            } | null,
        }
    }