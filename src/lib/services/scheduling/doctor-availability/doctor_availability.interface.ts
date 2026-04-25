export type DoctorAvailability = {
    id: number,
    doctorId: number,
    doctorScheduleId?: number,
    day_of_week: number,
    start_time: string,
    end_time: string,
    patient_limit: number,
}
export interface CreateDoctorAvailabilityDto {
    doctorScheduleId: number;
    day_of_week: number;
    start_time: string | Date;
    end_time: string | Date;
    patient_limit: number;
}