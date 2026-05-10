import { api, removeCI, removeDoctorId, removeToken, setToken, setUserName, setCI } from "@/lib/api";
import type { LoginRequest, LoginResponseData, LoginUser, RegisterUserRequest, RegisterUserResponseData, Role } from "./auth.interface";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../_shared/envelope";

const BASE_PATH = "/auth";

export const loginWithCredentials = async (payload: LoginRequest): Promise<LoginResponseData> => {
	const response = await api(`${BASE_PATH}/login`, {
		method: "POST",
		body: JSON.stringify(payload),
		skipUnauthorizedRedirect: true,
	});

	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}

	return readEnvelopeData<LoginResponseData>(response);
};


export const listRoles = async (): Promise<Role[]> => {
	const response = await api(`${BASE_PATH}/role`, { method: "GET" });
	if (!response.ok) return [];
	return readEnvelopeData<Role[]>(response);
};

export const registerUser = async (payload: RegisterUserRequest): Promise<RegisterUserResponseData> => {
	const response = await api(`${BASE_PATH}/register`, {
		method: "POST",
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
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
				return "/modules/pacient";
		default:
			return "/modules/admin/overview";
	}
};

export const persistLogin = (data: LoginResponseData) => {
	setToken(data.token);
	setUserName(data.user.name);
	setCI(data.user.ci);
};

export const doctorLogin = async () => {
	const credentials: LoginRequest = {
		ci: "29778174",
		password: "123456",
	};
	const data = await loginWithCredentials(credentials);
	persistLogin(data);
	return dashboardPathForUser(data.user, "DOCTOR");
};

export const receptionistLogin = async () => {
	const credentials: LoginRequest = {
		ci: "31987430",
		password: "123456",
	};
	const data = await loginWithCredentials(credentials);
	persistLogin(data);
	return dashboardPathForUser(data.user, "RECEPCIONISTA");
};

export const patientLogin = async () => {
	const credentials: LoginRequest = {
		ci: "27617584",
		password: "123456",
	};
	const data = await loginWithCredentials(credentials);
	persistLogin(data);
	return dashboardPathForUser(data.user, "PACIENTE");
};

export const adminLogin = async () => {
	const credentials: LoginRequest = {
		ci: "31350493",
		password: "123456",
	};
	const data = await loginWithCredentials(credentials);
	persistLogin(data);
	return dashboardPathForUser(data.user, "ADMIN");
};

export const logout = () => {
	removeToken();
	removeCI();
	removeDoctorId();
	window.location.href = "/login";
};