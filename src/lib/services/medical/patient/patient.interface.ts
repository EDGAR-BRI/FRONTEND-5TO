export type Patient = {
    id: number,
    userId: number | null,
    ci: string | null,
    name: string | null,
    active: boolean,
    last_visit_at: string | null,
    user: {
        id: number,
        ci: string,
        name: string,
        roleId: number,
        active: boolean,
        role: {
            id: number,
            name: string,
            code: string,
        }
    } | null,
    info_patient: InfoPatient | null
}

export type InfoPatient = {
    id: number,
    patientId: number,
    ci: string,
    name: string,
    last_name: string,
    sex: 'MALE' | 'FEMALE',
    birth_date: string,
    blood_type: string | null,
    nacionality: string | null,
    profession: string | null,
    main_phone: string | null,
    secondary_phone: string | null,
    email: string | null,
    address: string | null,
    city: string | null,
    allergies: string | null,
    chronic_diseases: string | null,
    current_medications: string | null,
    previous_surgeries: string | null,
    active: boolean
}

export type PatientPagination = {
    page: number,
    limit: number,
    total: number,
    totalPages: number
}

export type createPatientRequest = {
    userId?: number;
    ci?: string;
    name?: string;
    infoPatient?: CreateInfoPatientRequest;
}

export type CreateInfoPatientRequest = {
    ci: string;
    name: string;
    last_name: string;
    sex: 'MALE' | 'FEMALE';
    birth_date: string;
    blood_type?: string;
    nacionality?: string;
    profession?: string;
    main_phone?: string;
    secondary_phone?: string;
    email?: string;
    address?: string;
    city?: string;
    allergies?: string;
    chronic_diseases?: string;
    current_medications?: string;
    previous_surgeries?: string;
}

export type UpdateContactInfoRequest = {
    main_phone?: string;
    secondary_phone?: string;
    email?: string;
    address?: string;
    city?: string;
}