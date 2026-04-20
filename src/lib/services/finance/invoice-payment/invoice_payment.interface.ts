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
        invoice: {
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
    }