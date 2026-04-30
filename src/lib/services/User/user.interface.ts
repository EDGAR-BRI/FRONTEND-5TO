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
};

export type CreateUserRequest = {
	ci: string;
	name: string;
	password: string;
	roleId: number;
};

export type UpdateUserRequest = {
	ci?: string;
	name?: string;
	password?: string;
	roleId?: number;
};

