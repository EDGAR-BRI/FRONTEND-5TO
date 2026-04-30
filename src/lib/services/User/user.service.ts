import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "../_shared/envelope";
import type { CreateUserRequest, UpdateUserRequest, UserDto } from "./user.interface";

const BASE_PATH = "/auth/user";

export const createUser = async (payload: CreateUserRequest): Promise<UserDto> => {
	const response = await api(BASE_PATH, {
		method: "POST",
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}

	return readEnvelopeData<UserDto>(response);
};

export const listUsers = async (): Promise<UserDto[]> => {
	const response = await api(BASE_PATH, { method: "GET" });
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	return readEnvelopeData<UserDto[]>(response);
};

export const getUserById = async (id: number): Promise<UserDto> => {
	const response = await api(`${BASE_PATH}/${id}`, { method: "GET" });
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	return readEnvelopeData<UserDto>(response);
};

export const updateUser = async (id: number, payload: UpdateUserRequest): Promise<UserDto> => {
	const response = await api(`${BASE_PATH}/${id}`, {
		method: "PUT",
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	return readEnvelopeData<UserDto>(response);
};

// Soft delete (active=false)
export const deleteUser = async (id: number): Promise<UserDto> => {
	const response = await api(`${BASE_PATH}/${id}`, { method: "DELETE" });
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	return readEnvelopeData<UserDto>(response);
};

