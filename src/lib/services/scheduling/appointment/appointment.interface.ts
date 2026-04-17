export type DashboardSchedule =
    {
        date_time: string,
        patient: {
            user: {
                id: number,
                ci: string,
                name: string,
            },
        },
        doctor: {
            user: {
                id: number,
                ci: string,
                name: string,
            },
            specialty: {
                id: number,
                name: string,
            },
        },
        status: {
            id: number,
            name: string,
            color_hex?: string,
        },
    }
export type PaymentAcumulators =
    {
        paymentMethod: {
            id: number, name: string, type: string, currency: string, is_active: boolean
        },
        amount_paid: number // en dolaritos
    }