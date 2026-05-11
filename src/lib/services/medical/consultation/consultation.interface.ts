import type { SymptomsConsultaDto } from "./symptoms-consulta/symptoms-consulta.interface";
import type { ConsultationDiagnosisDto } from "./consultation-diagnosis/consultation-diagnosis.interface";
import type { ClinicalExaminationDto } from "./clinical-examination/clinical-examination.interface";

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

export interface ConsultationPrescriptionDto {
	id: number;
	consultationId: number;
	supplyId?: number | null;
	medication_name?: string | null;
	dosage?: string | null;
	frequency?: string | null;
	duration?: string | null;
	instructions?: string | null;
	active: boolean;
}

export interface ConsultationSupplyDto {
	id: number;
	supplyId: number;
	consultationId: number;
	quantity: string | number;
}

export interface ConsultationDetail {
	id: number;
	date: string;
	started_at: string | null;
	finished_at: string | null;
	invoice: Omit<ConsultationInvoiceRef, "patientId">;
	doctor: Omit<ConsultationDoctorRef, "userId">;
	symptomsConsultations: SymptomsConsultaDto[];
	consultationDiagnoses: ConsultationDiagnosisDto[];
	clinicalExaminations: ClinicalExaminationDto[];
	prescriptions: ConsultationPrescriptionDto[];
	supplies: ConsultationSupplyDto[];
}

export interface PatientSymptomRef {
	id: number;
	name: string;
}

export interface PatientSymptomDto {
	id: number;
	severity: string;
	duration: string;
	notes: string | null;
	symptom: PatientSymptomRef;
}

export interface PatientDiagnosisRef {
	id: number;
	code: string;
	description: string;
}

export interface PatientDiagnosisDto {
	id: number;
	is_primary: boolean;
	condition_status: string | null;
	onset_date: string | null;
	diagnosis: PatientDiagnosisRef;
}

export interface PatientClinicalExaminationDto {
	id: number;
	weight: string | null;
	height: string | null;
	temperature: string | null;
	systolic_bp: number | null;
	diastolic_bp: number | null;
	heart_rate: number | null;
	respiratory_rate: number | null;
	oxygen_saturation: string | null;
}

export interface PatientPrescriptionDto {
	id: number;
	medication_name: string | null;
	dosage: string | null;
	frequency: string | null;
	duration: string | null;
	instructions: string | null;
	active: boolean;
}

export interface PatientConsultationHistory {
	id: number;
	date: string;
	started_at: string | null;
	finished_at: string | null;
	doctor: Omit<ConsultationDoctorRef, "userId">;
	symptomsConsultations: PatientSymptomDto[];
	consultationDiagnoses: PatientDiagnosisDto[];
	clinicalExaminations: PatientClinicalExaminationDto[];
	prescriptions: PatientPrescriptionDto[];
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
