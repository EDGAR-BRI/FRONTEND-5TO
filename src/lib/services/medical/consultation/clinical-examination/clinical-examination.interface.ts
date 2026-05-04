export interface ClinicalExaminationDto {
    id: number;
    consultation_id: number;
    weight?: number | null;
    height?: number | null;
    temperature?: number | null;
    systolic_bp?: number | null;
    diastolic_bp?: number | null;
    heart_rate?: number | null;
    respiratory_rate?: number | null;
    oxygen_saturation?: number | null;
    created_at: string;
}

export interface CreateClinicalExaminationDto {
    weight?: string | number;
    height?: string | number;
    temperature?: string | number;
    systolic_bp?: number;
    diastolic_bp?: number;
    heart_rate?: number;
    respiratory_rate?: number;
    oxygen_saturation?: string | number;
}

export interface UpdateClinicalExaminationDto extends CreateClinicalExaminationDto {}
