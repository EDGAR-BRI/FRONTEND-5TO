export type PatientInfo =
{
    patientId?: number;

    ci: string;
    name: string;
    last_name: string;
    sex: 'MALE' | 'FEMALE';
    birth_date: Date;

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