export interface DiagnosisRef {
    id: number;
    code: string;
    description: string;
    category: string;
}

export interface ConsultationDiagnosisDto {
    id: number;
    consultation_id: number;
    diagnosisId: number;
    is_primary: boolean;
    condition_status?: string | null;
    onset_date?: string | null;
    created_at: string;
    diagnosis: DiagnosisRef;
}

export interface CreateConsultationDiagnosisDto {
    diagnosisId: number;
    is_primary: boolean;
    condition_status?: string;
    onset_date?: string | Date;
}

export interface UpdateConsultationDiagnosisDto {
    diagnosisId?: number;
    is_primary?: boolean;
    condition_status?: string;
    onset_date?: string | Date;
}
