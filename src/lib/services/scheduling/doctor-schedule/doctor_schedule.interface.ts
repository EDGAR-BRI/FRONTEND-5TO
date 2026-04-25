export type DoctorSchedule = {
    id: number;
    doctorId: number;
    period_start: string;
    period_end: string | null;
}

export interface CreateDoctorScheduleDto {
    doctorId: number;
    period_start: string | Date;
    period_end?: string | Date | null;
}
