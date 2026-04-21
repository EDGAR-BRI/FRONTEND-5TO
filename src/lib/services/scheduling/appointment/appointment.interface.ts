export type AppointmentsOverview =
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
export type Appointment =
    {
        id: number,
        doctorId: number,
        reson_visit: string,
        price: number,
        date_time: string,
        doctor: {
                id: number,
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
        patient: {
                id: number,
                user: {
                        id: number,
                        ci: string,
                        name: string,
                },
            },
        status: {
                id: number,
                name: string,
                color_hex: string,
        },
        type: {
                id: number,
                name: string,
            },
    }