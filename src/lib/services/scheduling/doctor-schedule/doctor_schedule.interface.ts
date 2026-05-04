export type DoctorSchedule = {
    id: number;
    doctorId: number;
    period_start: string;
    period_end: string | null;
    availabilities: {
            id: number,
            day_of_week: number,
            start_time: string,
            end_time: string,
            patient_limit: number,
    }
}

export interface CreateDoctorScheduleDto {
    doctorId: number;
    period_start: string | Date;
    period_end?: string | Date | null;
}
export interface UpdateDoctorScheduleDto {
    doctorId?: number;
    period_start?: string | Date;
    period_end?: string | Date | null;
}