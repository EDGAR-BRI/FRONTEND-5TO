import useSWR from "swr";
import {
    listConsultationsByPatient,
    type PatientConsultationHistory,
} from "@/lib/services/medical/consultation/consultation.service";

interface UsePatientConsultationHistoryResult {
    consultations: PatientConsultationHistory[];
    isLoading: boolean;
    error: Error | undefined;
}

export function usePatientConsultationHistory(
    patientId: number | null
): UsePatientConsultationHistoryResult {
    const shouldFetch = patientId !== null;
    const { data, isLoading, error } = useSWR<PatientConsultationHistory[]>(
        shouldFetch ? `/medical/consultation/patient/${patientId}` : null,
        () => listConsultationsByPatient(patientId as number)
    );

    return { consultations: data ?? [], isLoading, error };
}
