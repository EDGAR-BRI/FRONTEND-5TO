import { defineMiddleware } from "astro/middleware";

const ROLE_ROUTES: Record<string, string> = {
    "admin": "ADMIN",
    "doctor": "DOCTOR",
    "receptionist": "RECEPTION",
    "pacient": "PATIENT",
};

const ROLE_DASHBOARD: Record<string, string> = {
    "ADMIN": "/modules/admin/overview",
    "DOCTOR": "/modules/doctor",
    "RECEPTION": "/modules/receptionist",
    "PATIENT": "/modules/pacient",
};

const PUBLIC_ROUTES = ["/login", "/register", "/docs", "/api"];
const PUBLIC_ROUTES_EXACT = ["/", "/login", "/register"];

const isDev = import.meta.env.DEV;

const API_URL = (() => {
    const raw = process.env.PUBLIC_BACKEND_URL?.trim();
    if (isDev) console.log("[MIDDLEWARE] PUBLIC_BACKEND_URL:", raw);
    if (!raw && process.env.DEV) {
        return "http://localhost:3800/api/v1";
    }
    return raw || "http://localhost:3800/api/v1";
})();

const getCookie = (cookies: any, name: string): string | null => {
    const cookie = cookies.get(name);
    return cookie?.value || null;
};

const deleteCookie = (cookies: any, name: string): void => {
    cookies.delete(name, { path: "/" });
};

const decodeJWT = (token: string): { id: number; ci: string; iat: number; exp: number } | null => {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const payload = parts[1];
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const decoded = Buffer.from(base64, "base64").toString("utf-8");
        return JSON.parse(decoded);
    } catch {
        return null;
    }
};

const getUserIdFromToken = (token: string | null): number | null => {
    if (!token) return null;
    const decoded = decodeJWT(token);
    return decoded?.id ?? null;
};

const normalizeRoleCode = (code: string): string => {
    return code
        .toString()
        .trim()
        .toUpperCase()
        .replaceAll("Á", "A")
        .replaceAll("É", "E")
        .replaceAll("Í", "I")
        .replaceAll("Ó", "O")
        .replaceAll("Ú", "U");
};

const getRoleFromPath = (pathname: string): string | null => {
    const match = pathname.match(/^\/modules\/(\w+)/);
    if (!match) return null;
    return ROLE_ROUTES[match[1]] ?? null;
};

const getRoleSegment = (role: string): string | null => {
    for (const [segment, roleCode] of Object.entries(ROLE_ROUTES)) {
        if (roleCode === role) return segment;
    }
    return null;
};

const getUserIdFromPath = (pathname: string): number | null => {
    const match = pathname.match(/^\/modules\/\w+\/(\d+)(?:\/|$)/);
    if (!match) return null;
    const parsed = Number(match[1]);
    return Number.isInteger(parsed) ? parsed : null;
};

const getDashboardPath = (role: string, userId: number): string => {
    const base = ROLE_DASHBOARD[role] ?? "/login";
    if (role === "DOCTOR" || role === "RECEPTION" || role === "PATIENT") {
        return `${base}/${userId}/overview`;
    }
    return base;
};

const fetchUserRole = async (userId: number, token: string): Promise<string | null> => {
    try {
        if (isDev) console.log("[MIDDLEWARE fetchUserRole] userId:", userId, "token exists:", !!token);
        const res = await fetch(`${API_URL}/auth/user/${userId}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (isDev) console.log("[MIDDLEWARE fetchUserRole] response status:", res.status);
        if (!res.ok) {
            if (isDev) console.log("[MIDDLEWARE fetchUserRole] response not ok");
            return null;
        }
        const data = await res.json();
        if (isDev) console.log("[MIDDLEWARE fetchUserRole] data:", JSON.stringify(data));
        return normalizeRoleCode(data.data.role?.code ?? "");
    } catch (err) {
        console.log("[MIDDLEWARE fetchUserRole] error:", err);
        return null;
    }
};

const fetchPatientOwnerUserId = async (patientId: number, token: string): Promise<number | null> => {
    try {
        const res = await fetch(`${API_URL}/medical/patient/${patientId}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!res.ok) {
            return null;
        }

        const data = await res.json();
        const owner = data?.data?.userId ?? data?.data?.user?.id;
        return typeof owner === "number" ? owner : null;
    } catch {
        return null;
    }
};

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, cookies, redirect } = context;
    const pathname = url.pathname;

    if (isDev) console.log("[MIDDLEWARE] Request to:", pathname);

    if (pathname.startsWith("/_astro") || pathname.startsWith("/assets")) {
        return next();
    }

    if (pathname.startsWith("/no-encontrado")) {
        return next();
    }

    if (pathname === "/logout") {
        deleteCookie(cookies, "auth_token");
        deleteCookie(cookies, "auth_user_name");
        deleteCookie(cookies, "user_ci");
        return redirect("/login");
    }

    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
    if (isPublicRoute) {
        return next();
    }

    const isExactPublicRoute = PUBLIC_ROUTES_EXACT.includes(pathname);
    if (isExactPublicRoute) {
        return next();
    }

    const requiredRole = getRoleFromPath(pathname);
    if (isDev) console.log("[MIDDLEWARE] requiredRole:", requiredRole);
    if (!requiredRole) {
        return next();
    }

    const token = getCookie(cookies, "auth_token");
    if (isDev) console.log("[MIDDLEWARE] token exists:", !!token);
    if (!token) {
        if (isDev) console.log("[MIDDLEWARE] No token, redirecting to /login");
        return redirect("/login");
    }

    const userId = getUserIdFromToken(token);
    if (isDev) console.log("[MIDDLEWARE] userId:", userId);
    if (!userId) {
        if (isDev) console.log("[MIDDLEWARE] Invalid token, redirecting to /login");
        return redirect("/login");
    }

    const userRole = await fetchUserRole(userId, token);
    if (isDev) console.log("[MIDDLEWARE] userRole:", userRole);
    if (!userRole) {
        if (isDev) console.log("[MIDDLEWARE] No userRole from API, redirecting to /login");
        return redirect("/login");
    }

    if (userRole !== requiredRole) {
        if (isDev) console.log("[MIDDLEWARE] Role mismatch:", userRole, "!=", requiredRole, "redirecting to /no-encontrado");
        return redirect("/no-encontrado");
    }

    // Patient pages must only access their own patient IDs.
    if (requiredRole === "PATIENT") {
        const match = pathname.match(/^\/modules\/pacient\/(\d+)(?:\/|$)/);
        if (match) {
            const patientId = Number(match[1]);
            const ownerUserId = await fetchPatientOwnerUserId(patientId, token);

            if (!ownerUserId || ownerUserId !== userId) {
                console.log("[MIDDLEWARE] PATIENT ownership mismatch. userId:", userId, "patient owner:", ownerUserId);
                return redirect("/no-encontrado");
            }
        }
    }

    console.log("[MIDDLEWARE] Access granted");
    return next();
});
