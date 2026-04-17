import { useMemo, useState } from "react";
import { ModalTrigger } from "@/components/react/primary/ModalTrigger";
import { Field } from "@/components/react/primary/Field";
import { Select, type SelectOption } from "@/components/react/primary/Select";
import { CheckBox } from "@/components/react/primary/CheckBox";
import { Button, ButtonTheme } from "@/components/react/primary/Button";

import type { User, UserRole, UserStatus } from "@/types/User";

type UserDraft = {
    name: string;
    email: string;
    role: UserRole | "";
    status: UserStatus;
};

export default function EditUserModalTrigger({ user }: { user: User }) {
    const initialDraft: UserDraft = {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
    };
    const [draft, setDraft] = useState<UserDraft>(initialDraft);

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
            buttonLabel="Editar"
            buttonTheme={ButtonTheme.SECONDARY}
            modalTitle={`Editar usuario - ${user.name}`}
        >
            {({ close }) => (
                <form
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();

                        // Mock: log to console
                        console.log("🧾 Editar usuario (mock)", { id: user.id, ...draft });

                        close();
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

                    <Select
                        label="Rol"
                        name="role"
                        options={roleOptions}
                        placeholder="Selecciona un rol"
                        value={draft.role}
                        onChange={(v) => set("role", v as UserRole)}
                        required
                    />

                    <div className="flex items-center justify-between gap-4 pt-2">
                        <CheckBox
                            label="Activo"
                            variant="switch"
                            checked={draft.status === "ACTIVO"}
                            onChange={(e) => set("status", e.target.checked ? "ACTIVO" : "INACTIVO")}
                            name="status"
                        />

                        <div className="flex gap-3">
                            <Button
                                label="Cancelar"
                                variant={ButtonTheme.SECONDARY}
                                type="button"
                                onClick={() => {
                                    close();
                                    setDraft(initialDraft);
                                }}
                            />
                            <Button label="Guardar cambios" type="submit" />
                        </div>
                    </div>
                </form>
            )}
        </ModalTrigger>
    );
}
