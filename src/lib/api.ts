// Si no hay backend configurado, apuntamos a los endpoints locales de Astro.
// Esto permite trabajar con mocks durante el desarrollo sin levantar un servidor aparte.
const normalizeBackendBaseUrl = (raw: string): string => {
    const trimmed = raw.trim().replace(/\/+$/, "");

    // Allow setting either:
    // - http://localhost:3800
    // - http://localhost:3800/api/v1
    // - https://example.com/api/v2
    if (/\/api\/v\d+$/i.test(trimmed)) return trimmed;

    return `${trimmed}/api/v1`;
};

export const API_URL = import.meta.env.PUBLIC_BACKEND_URL
    ? normalizeBackendBaseUrl(import.meta.env.PUBLIC_BACKEND_URL)
    : "/api/v1";
import Cookies from "js-cookie";
import type { AstroCookies } from "astro";

const TOKEN_KEY = "auth_token";

export const getToken = (cookies?: AstroCookies): string | null => {
    // Si estamos en el servidor y tenemos acceso a las cookies de Astro
    if (typeof window === "undefined" && cookies) {
        return cookies.get(TOKEN_KEY)?.value || null;
    }

    // Si estamos en el cliente, usar js-cookie
    if (typeof window !== "undefined") {
        return Cookies.get(TOKEN_KEY) || null;
    }

    return null;
};

const USER_NAME_KEY = "auth_user_name";

export const setToken = (token: string): void => {
    Cookies.set(TOKEN_KEY, token, {
        expires: 7,
        path: "/",
        sameSite: "lax", // Protege contra CSRF
        secure: import.meta.env.PROD // Solo HTTPS en producción, permite HTTP en desarrollo
    });
};

export const setUserName = (name: string): void => {
    Cookies.set(USER_NAME_KEY, name, {
        expires: 7,
        path: "/",
        sameSite: "lax",
        secure: import.meta.env.PROD // Solo HTTPS en producción, permite HTTP en desarrollo
    });
};

export const getUserName = (cookies?: AstroCookies): string | null => {
    if (typeof window === "undefined" && cookies) {
        return cookies.get(USER_NAME_KEY)?.value || null;
    }
    if (typeof window !== "undefined") {
        return Cookies.get(USER_NAME_KEY) || null;
    }
    return null;
};

export const removeUserName = (): void => {
    Cookies.remove(USER_NAME_KEY, { path: "/" });
};

export const removeToken = (): void => {
    Cookies.remove(TOKEN_KEY, { path: "/" });
    removeUserName();
};

interface ApiOptions extends RequestInit {
    headers?: Record<string, string>;
}

export const api = async (endpoint: string, options: ApiOptions = {}, cookies?: AstroCookies) => {
    const token = getToken(cookies);

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    const response = await fetch(`${API_URL}${cleanEndpoint}`, config);

    if (response.status === 401) {

        if (typeof window !== "undefined") {
            removeToken();

            window.location.href = '/login';

        } else {
            // En el servidor, lanzamos error para que Astro lo capture
            throw new Error("Unauthorized");
        }
    }

    return response;
};


