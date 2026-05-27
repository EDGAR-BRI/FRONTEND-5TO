export type UserRoleDto = {
	id: number;
	name: string;
	code: string;
};

// DTO estándar de User que devuelve el backend (sin password)
export type UserDto = {
	id: number;
	ci: string;
	name: string;
	roleId: number;
	active: boolean;
	role?: UserRoleDto;
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
};

export type CreateUserRequest = {
	ci: string;
	name: string;
	password: string;
	roleId: number;
	specialtyId?: number;
};

export type UpdateUserRequest = {
	ci?: string;
	name?: string;
	password?: string;
	roleId?: number;
	specialtyId?: number;
};

