import type { APIRoute } from "astro";

import type { UserRole, UserStatus } from "@/types/User";

// Extracted from src/types/User.ts for reference
type UserMock = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    createdAt?: string;
    updatedAt?: string;
};

const mockUsers: UserMock[] = [
    {
        id: 1,
        name: "Dr. Roberto Gómez",
        email: "roberto.gomez@clinica.com",
        role: "DOCTOR",
        status: "ACTIVO",
        createdAt: "2023-01-15T08:30:00Z",
    },
    {
        id: 2,
        name: "Ana Morales",
        email: "ana.morales@clinica.com",
        role: "ADMIN",
        status: "ACTIVO",
        createdAt: "2023-02-20T10:15:00Z",
    },
    {
        id: 3,
        name: "Carlos Rivera",
        email: "carlos.rivera@clinica.com",
        role: "RECEPCIONISTA",
        status: "ACTIVO",
        createdAt: "2023-03-05T09:00:00Z",
    },
    {
        id: 4,
        name: "María López",
        email: "maria.lopez@correo.com",
        role: "PACIENTE",
        status: "ACTIVO",
        createdAt: "2023-04-12T14:45:00Z",
    },
    {
        id: 5,
        name: "Dra. Sofía Mendoza",
        email: "sofia.mendoza@clinica.com",
        role: "DOCTOR",
        status: "ACTIVO",
        createdAt: "2023-05-18T11:20:00Z",
    },
    {
        id: 6,
        name: "Fernando Ruiz",
        email: "fernando.ruiz@correo.com",
        role: "PACIENTE",
        status: "INACTIVO",
        createdAt: "2023-06-25T16:30:00Z",
    },
    {
        id: 7,
        name: "Lucía Ortiz",
        email: "lucia.ortiz@correo.com",
        role: "PACIENTE",
        status: "ACTIVO",
        createdAt: "2023-07-30T08:00:00Z",
    },
    {
        id: 8,
        name: "Jorge Torres",
        email: "jorge.torres@clinica.com",
        role: "RECEPCIONISTA",
        status: "INACTIVO",
        createdAt: "2023-08-10T13:10:00Z",
    },
];

export const GET: APIRoute = async ({ request }) => {
    const businessId = request.headers.get("x-business-id");

    return new Response(JSON.stringify(mockUsers), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "x-mock": "true",
            ...(businessId ? { "x-business-id": businessId } : {}),
        },
    });
};
