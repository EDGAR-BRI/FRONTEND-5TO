export interface SymptomRef {
    id: number;
    name: string;
}

export interface SymptomsConsultaDto {
    id: number;
    symptoms_id: number;
    consultation_id: number;
    severity: string;
    duration: string;
    notes?: string | null;
    created_at: string;
    symptom: SymptomRef;
}

export interface CreateSymptomsConsultaDto {
    symptomId: number;
    severity: string;
    duration: string;
    notes?: string;
}

export interface UpdateSymptomsConsultaDto {
    symptomId?: number;
    severity?: string;
    duration?: string;
    notes?: string;
}
