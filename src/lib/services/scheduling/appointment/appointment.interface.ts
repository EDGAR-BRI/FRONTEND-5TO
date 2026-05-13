export type AppointmentsOverview =
    {
        id: number,
        date_time: string,
        price: number,
        patient: {
            id?: number,
            ci?: string | null,
            name?: string | null,
            user?: {
                id: number,
                ci: string,
                name: string,
            } | null,
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
            name: string,
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
export type CreateAppointmentDto =
    {
        doctorId?: number;
        specialtyId?: number;
        patientId: number;
        statusId: number;
        typeId: number;
        reson_visit?: string;
        price: string | number;
        date_time: string | Date;
    }
export type UpdateAppointmentDto = Partial<CreateAppointmentDto>;

export type WeeklyFlowDay = {
    day: string;
    date: string;
    count: number;
    statuses: {
        name: string;
        color: string;
        count: number;
    }[];
};

export type WeeklyFlowResponse = {
    range: string;
    start: string;
    end: string;
    total: number;
    days: WeeklyFlowDay[];
};

export type DoctorStatsResponse = {
    citasHoy: number;
    pacientesAtendidos: number;
};
