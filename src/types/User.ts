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
	doctor?: {
		id: number;
		specialtyId: number;
		specialty?: {
			id: number;
			name: string;
			consultation_price: number;
			commission_percentage: number;
		};
	};
	createdAt?: string;
	updatedAt?: string;
}
