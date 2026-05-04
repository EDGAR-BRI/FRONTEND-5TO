export type UserRole = "ADMIN" | "DOCTOR" | "PACIENTE" | "RECEPCIONISTA";
export type UserStatus = "ACTIVO" | "INACTIVO";

export interface User {
	id: number;
	ci: string;
	name: string;
	email?: string;
	roleId?: number;
	role: UserRole;
	status: UserStatus;
	createdAt?: string;
	updatedAt?: string;
}
