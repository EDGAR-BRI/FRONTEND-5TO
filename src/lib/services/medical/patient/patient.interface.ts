export type Patient = {
    id: number,
    userId: number,
    ci: string,
    name: string,
    active: boolean,
    user: {
        id: number,
        ci: string,
        name: string,
        roleId: number,
        active: boolean,
        role: {
            id: number,
            name: string,
            code: string,
        }
    }
}
export type createPatientRequest = {
    userId: number;
    ci: string;
    name: string;
}