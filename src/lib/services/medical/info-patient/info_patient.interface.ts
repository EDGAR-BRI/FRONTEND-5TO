export type PatientInfo =
{
    id: number;
    patientId?: number;

    ci: string;
    name: string;
    last_name: string;
    sex: 'MALE' | 'FEMALE';
    birth_date: string;

    blood_type?: string | null;
    nacionality?: string | null;
    profession?: string | null;

    main_phone?: string | null;
    secondary_phone?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;

    allergies?: string | null;
    chronic_diseases?: string | null;
    current_medications?: string | null;
    previous_surgeries?: string | null;

    last_visit_at?: Date | null;
}

export type UpdateContactInfoPayload = {
    main_phone?: string;
    secondary_phone?: string;
    email?: string;
    address?: string;
    city?: string;
}