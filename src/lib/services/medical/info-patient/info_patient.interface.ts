export type PatientInfo =
{
    patientId?: number;
    patient?: {
        id?: number;
        name?: string | null;
        ci?: string | null;
        last_visit_at?: string | null;
        user?: {
            name?: string | null;
            ci?: string | null;
        } | null;
    } | null;

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
