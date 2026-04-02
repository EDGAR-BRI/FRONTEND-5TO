import { api } from "@/lib/api";
import { setToken, setUserName } from "@/lib/api";
import type { LoginRequest, LoginResponseData, LoginUser, RegisterUserRequest, RegisterUserResponseData, Role } from "./auth.interface";

import { readEnvelopeData } from "../_shared/envelope";

export const loginWithCredentials = async (payload: LoginRequest): Promise<LoginResponseData> => {
	const response = await api("/auth/login", {
		method: "POST",
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		let message = `Error ${response.status}: ${response.statusText}`;
		try {
			const json = (await response.json()) as any;
			message = json?.message || json?.error || json?.data?.message || message;
		} catch {
			// ignore
		}
		throw new Error(message);
	}

	return readEnvelopeData<LoginResponseData>(response);
};


export const listRoles = async (): Promise<Role[]> => {
	const response = await api("/auth/role", { method: "GET" });
	if (!response.ok) return [];
	return readEnvelopeData<Role[]>(response);
};

export const registerUser = async (payload: RegisterUserRequest): Promise<RegisterUserResponseData> => {
	const response = await api("/auth/register", {
		method: "POST",
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		let message = `Error ${response.status}: ${response.statusText}`;
		try {
			const json = (await response.json()) as any;
			message = json?.message || json?.error || json?.data?.message || message;
		} catch {
			// ignore
		}
		throw new Error(message);
	}
	return readEnvelopeData<RegisterUserResponseData>(response);
};

const normalizeRoleCode = (value: string) =>
	value
		.toString()
		.trim()
		.toUpperCase()
		.replaceAll("Á", "A")
		.replaceAll("É", "E")
		.replaceAll("Í", "I")
		.replaceAll("Ó", "O")
		.replaceAll("Ú", "U");

export const resolveRoleCode = (user: LoginUser): "ADMIN" | "DOCTOR" | "RECEPCIONISTA" | "PACIENTE" | "UNKNOWN" => {
	const codeFromRole = user.role?.code ? normalizeRoleCode(user.role.code) : "";
	if (codeFromRole === "ADMIN") return "ADMIN";
	if (codeFromRole === "DOCTOR") return "DOCTOR";
	if (codeFromRole === "RECEPCIONISTA" || codeFromRole === "RECEPTION" || codeFromRole === "RECEPTIONIST") return "RECEPCIONISTA";
	if (codeFromRole === "PACIENTE" || codeFromRole === "PACIENT" || codeFromRole === "PATIENT") return "PACIENTE";

	// Si el backend no envía `role.code`, el caller puede resolverlo consultando /auth/role.
	return "UNKNOWN";
};

export const dashboardPathForUser = (user: LoginUser, roleCodeOverride?: string): string => {
	const role = roleCodeOverride ? resolveRoleCode({ ...user, role: { id: user.role?.id ?? 0, name: user.role?.name ?? "", code: roleCodeOverride } }) : resolveRoleCode(user);
	const id = user.id;

	switch (role) {
		case "ADMIN":
			return "/modules/admin/overview";
		case "DOCTOR":
			return `/modules/doctor/${id}/overview`;
		case "RECEPCIONISTA":
			return `/modules/receptionist/${id}/overview`;
		case "PACIENTE":
			return `/modules/pacient/${id}/overview`;
		default:
			return "/modules/admin/overview";
	}
};

export const persistLogin = (data: LoginResponseData) => {
	setToken(data.token);
	setUserName(data.user.name);
};
