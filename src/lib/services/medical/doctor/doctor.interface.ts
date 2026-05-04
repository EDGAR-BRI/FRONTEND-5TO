export type DoctorSchedConfigOption = 
{
    id: number,
    user: {
        ci: string,
        name: string
    },
    specialty: {
        name: string
        consultation_price: number,
    }
}

export type DoctorDetail = {
    id: number;
    userId: number;
    specialtyId: number;
    user: {
        id: number;
        ci: string;
        name: string;
        active: boolean;
        role: { name: string; code: string };
    };
    specialty: {
        id: number;
        name: string;
        consultation_price: number;
        commission_percentage: number;
    };
}