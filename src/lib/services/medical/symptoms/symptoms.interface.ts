export interface Symptom {
    id: number;
    name: string;
}

export interface CreateSymptomDto {
    name: string;
}

export interface UpdateSymptomDto {
    name?: string;
}
