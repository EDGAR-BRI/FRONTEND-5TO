import useSWR from "swr";
import { getPatientInfo } from "@/lib/services/medical/info-patient/info_patient.service";
import type { PatientInfo } from "@/lib/services/medical/info-patient/info_patient.interface";

interface UsePatientInfoResult {
    data: PatientInfo | undefined;
    isLoading: boolean;
    error: Error | undefined;
}

export function usePatientInfo(patientId: number | null): UsePatientInfoResult {
    const shouldFetch = patientId !== null;
    const { data, isLoading, error } = useSWR<PatientInfo>(
        shouldFetch ? `/medical/info-patient/patient/${patientId}` : null,
        () => getPatientInfo(patientId as number)
    );

    return { data, isLoading, error };
}
