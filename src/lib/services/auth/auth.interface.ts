export type LoginRequest = {
    ci: string;
    password: string;
};

export type LoginUser = {
    id: number;
    ci: string;
    name: string;
    roleId?: number;
    active?: boolean;
    role?: { id: number; name: string; code: string };
};

// DTO estándar que devuelve el backend para User (sin password)
export type UserDto = {
    id: number;
    ci: string;
    name: string;
    roleId: number;
    active: boolean;
    role?: { id: number; name: string; code: string };
};

export type LoginResponseData = {
    user: LoginUser;
    token: string;
};


export type RegisterUserRequest = {
    ci: string;
    name: string;
    password: string;
    roleId?: number;
};

// Response `data` de POST /api/v1/auth/register
export type RegisterUserResponseData = UserDto;

export type Role = { id: number; name: string; code: string; active?: boolean };