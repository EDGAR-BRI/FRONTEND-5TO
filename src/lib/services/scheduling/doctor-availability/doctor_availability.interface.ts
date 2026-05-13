export type DoctorAvailability = { 
    id: number; 
    doctorScheduleId?: number | undefined; 
    day_of_week: number; 
    start_time: string; 
    end_time: string; 
    patient_limit: number; 
}
export interface CreateDoctorAvailabilityDto {
    doctorScheduleId: number;
    day_of_week: number;
    start_time: string | Date;
    end_time: string | Date;
    patient_limit: number;
}

export type UpdateDoctorAvailabilityDto = {
    doctorId?: number;
    day_of_week?: number;
    start_time?: string | Date;
    end_time?: string | Date;
    patient_limit?: number;
}
