// La URL del backend debe apuntar al backend real (no mocks locales de Astro).
// Se configura con `PUBLIC_BACKEND_URL` (ej: http://localhost:3800/api/v1).
const resolveBackendUrl = (): string => {
    const raw = import.meta.env.PUBLIC_BACKEND_URL?.trim();

    // En desarrollo, si no se configuró explícitamente, usamos el backend local real.
    // En producción, exigimos que venga configurado.
    const resolved = raw || (import.meta.env.DEV ? "http://localhost:3800/api/v1" : "");
    if (!resolved) {
        throw new Error(
            "Missing PUBLIC_BACKEND_URL. Set it to your backend base URL (e.g. http://localhost:3800/api/v1)."
        );
    }

    // Cuando se abre el frontend desde otra PC usando una IP/hostname de red,
    // `localhost` en el navegador apunta a la PC cliente, no a la PC servidor.
    // Si el backend está configurado como localhost, lo reescribimos al hostname actual.
    if (typeof window !== "undefined") {
        const browserHost = window.location.hostname;
        const isRemoteBrowser = browserHost !== "localhost" && browserHost !== "127.0.0.1";

        if (isRemoteBrowser && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(resolved)) {
            const rewritten = resolved.replace(
                /^((?:https?:\/\/))(localhost|127\.0\.0\.1)/i,
                `$1${browserHost}`
            );
            return rewritten;
        }
    }

    return resolved;
};

export const API_URL = resolveBackendUrl();
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

const CI_KEY = "user_ci"
export const removeCI = (): void => {
    Cookies.remove(CI_KEY, { path: "/" });
};
export const setCI = (ci: string): void => {
    Cookies.set(CI_KEY, ci, {
        expires: 7,
        path: "/",
        sameSite: "lax",
        secure: import.meta.env.PROD // Solo HTTPS en producción, permite HTTP en desarrollo
    });
};

export const getCI = (cookies?: AstroCookies): string | null => {
    if (typeof window === "undefined" && cookies) {
        return cookies.get(CI_KEY)?.value || null;
    }
    if (typeof window !== "undefined") {
        return Cookies.get(CI_KEY) || null;
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
    try {
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
        
        // Asignamos la URL completa a una variable para poder auditarla
        const targetUrl = `${API_URL}${cleanEndpoint}`;

        // === INICIO DE AUDITORÍA ESTRICTA ===
        console.log("----- DEBUGGING FETCH -----");
        console.log("1. Variable API_URL:", API_URL);
        console.log("2. URL Final Ensamblada:", targetUrl);
        console.log("---------------------------");
        // === FIN DE AUDITORÍA ESTRICTA ===

        const response = await fetch(targetUrl, config);

        if (response.status === 401) {
            if (typeof window !== "undefined") {
                removeToken();
                window.location.href = '/login';
            } else {
                throw new Error("Unauthorized");
            }
        }
        return response;
    } catch (error) {
        console.error("Error fetching API:", error);
        throw error;
    }
};


