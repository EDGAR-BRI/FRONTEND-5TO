import React, { useMemo, useState } from "react";
import { ModalTrigger } from "@/components/react/primary/ModalTrigger";
import { Field } from "@/components/react/primary/Field";
import { Select, type SelectOption } from "@/components/react/primary/Select";
import { CheckBox } from "@/components/react/primary/CheckBox";
import { Button, ButtonTheme } from "@/components/react/primary/Button";

import type { UserRole, UserStatus } from "@/types/User";

type UserDraft = {
    name: string;
    email: string;
    role: UserRole | "";
    password: string;
    status: UserStatus;
};

const emptyDraft = (): UserDraft => ({
    name: "",
    email: "",
    role: "",
    password: "",
    status: "ACTIVO",
});

export default function CreateUserModalTrigger() {
    const [draft, setDraft] = useState<UserDraft>(emptyDraft);

    const roleOptions: SelectOption[] = useMemo(
        () => [
            { value: "ADMIN", label: "Administrador" },
            { value: "DOCTOR", label: "Doctor" },
            { value: "RECEPCIONISTA", label: "Recepcionista" },
            { value: "PACIENTE", label: "Paciente" },
        ],
        []
    );

    const set = <K extends keyof UserDraft>(key: K, value: UserDraft[K]) => {
        setDraft((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <ModalTrigger
            buttonLabel="Agregar usuario"
            buttonTheme={ButtonTheme.PRIMARY}
            modalTitle="Crear nuevo usuario"
        >
            {({ close }) => (
                <form
                    className="space-y-4 w-full"
                    onSubmit={(e) => {
                        e.preventDefault();

                        // Mock: log to console
                        console.log("🧾 Crear usuario (mock)", draft);

                        close();
                        setDraft(emptyDraft());
                    }}
                >
                    <Field
                        label="Nombre completo"
                        name="name"
                        placeholder="Ej: Juan Pérez"
                        value={draft.name}
                        onChange={(e) => set("name", e.target.value)}
                        required
                    />

                    <Field
                        label="Correo electrónico"
                        name="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={draft.email}
                        onChange={(e) => set("email", e.target.value)}
                        required
                    />

                    <Field
                        label="Contraseña"
                        name="ctrsñ"
                        type="password"
                        placeholder="CI o 1234"
                        value={draft.password}
                        onChange={(e) => set("password", e.target.value)}
                        required
                    />

                    <Select
                        label="Rol"
                        name="role"
                        options={roleOptions}
                        placeholder="Selecciona un rol"
                        value={draft.role}
                        onChange={(v) => set("role", v as UserRole)}
                        required
                    />

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <CheckBox
                            label="Activo"
                            variant="switch"
                            checked={draft.status === "ACTIVO"}
                            onChange={(e) => set("status", e.target.checked ? "ACTIVO" : "INACTIVO")}
                            name="status"
                        />

                        <div className="flex gap-3 shrink-0 ml-auto">
                            <Button
                                label="Cancelar"
                                variant={ButtonTheme.SECONDARY}
                                type="button"
                                onClick={() => {
                                    close();
                                    setDraft(emptyDraft());
                                }}
                            />
                            <Button label="Guardar" type="submit" />
                        </div>
                    </div>
                </form>
            )}
        </ModalTrigger>
    );
}
