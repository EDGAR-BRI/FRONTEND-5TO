export interface ConsultationPatientUserRef {
	ci: string;
	name: string;
}

export interface ConsultationPatientRef {
	id: number;
	ci: string;
	name: string;
	user: ConsultationPatientUserRef;
}

export interface ConsultationInvoiceRef {
	id: number;
	patientId?: number;
	total_usd: string;
	patient: ConsultationPatientRef;
}

export interface ConsultationDoctorUserRef {
	id: number;
	ci: string;
	name: string;
}

export interface ConsultationSpecialtyRef {
	id: number;
	name: string;
}

export interface ConsultationDoctorRef {
	id: number;
	userId?: number;
	specialtyId: number;
	user: ConsultationDoctorUserRef;
	specialty: ConsultationSpecialtyRef;
}

export interface ConsultationSummary {
	id: number;
	invoiceId: number;
	doctorId: number;
	date: string;
	started_at: string | null;
	finished_at: string | null;
	invoice: ConsultationInvoiceRef;
	doctor: ConsultationDoctorRef;
}

export interface ConsultationDetail {
	id: number;
	date: string;
	started_at: string | null;
	finished_at: string | null;
	invoice: Omit<ConsultationInvoiceRef, "patientId">;
	doctor: Omit<ConsultationDoctorRef, "userId">;
	symptomsConsultations: unknown[];
	consultationDiagnoses: unknown[];
	clinicalExaminations: unknown[];
	prescriptions: unknown[];
	supplies: unknown[];
}

export interface CreateConsultationDto {
	invoiceId: number;
	doctorId: number;
	date?: string | Date;
}

export interface UpdateConsultationDto {
	doctorId?: number;
	date?: string | Date;
	started_at?: string | Date;
	finished_at?: string | Date;
	symptoms?: string;
	diagnosis?: string;
	physical_exam?: string;
}

export interface FinishConsultationSupplyDto {
	supplyId: number;
	quantity: number;
}

export interface FinishConsultationPrescriptionDto {
	supplyId?: number;
	medication_name?: string;
	dosage?: string;
	frequency?: string;
	duration?: string;
	instructions?: string;
	active?: boolean;
}

export interface FinishConsultationSymptomDto {
	symptomId: number;
	severity: string;
	duration: string;
	notes?: string;
}

export interface FinishConsultationClinicalExaminationDto {
	weight?: number;
	height?: number;
	temperature?: number;
	systolic_bp?: number;
	diastolic_bp?: number;
	heart_rate?: number;
	respiratory_rate?: number;
	oxygen_saturation?: number;
}

export interface FinishConsultationDiagnosisDto {
	diagnosisId: number;
	is_primary: boolean;
	condition_status?: string;
	onset_date?: string | Date;
}

export interface FinishConsultationDto {
	finished_at?: string | Date;
	supplies: FinishConsultationSupplyDto[];
	prescriptions: FinishConsultationPrescriptionDto[];
	symptomsConsultas: FinishConsultationSymptomDto[];
	clinicalExaminations: FinishConsultationClinicalExaminationDto[];
	consultationDiagnoses: FinishConsultationDiagnosisDto[];
}
