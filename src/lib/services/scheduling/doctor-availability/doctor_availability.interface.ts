export type DoctorAvailability = {
    id: number,
    day_of_week: number,
    start_time: string,
    end_time: string,
    patient_limit: number,
}