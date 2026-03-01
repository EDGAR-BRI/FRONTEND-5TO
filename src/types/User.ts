export type UserRole = "ADMIN" | "DOCTOR" | "PACIENTE" | "RECEPCIONISTA";
export type UserStatus = "ACTIVO" | "INACTIVO";

export interface User {
	id: number;
	name: string;
	email: string;
	role: UserRole;
	status: UserStatus;
	createdAt?: string;
	updatedAt?: string;
}
