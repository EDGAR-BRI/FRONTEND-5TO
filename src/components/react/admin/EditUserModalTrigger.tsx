import { useEffect, useMemo, useState } from "react";
import { ModalTrigger } from "@/components/react/primary/ModalTrigger";
import { Field } from "@/components/react/primary/Field";
import { Select, type SelectOption } from "@/components/react/primary/Select";
import { CheckBox } from "@/components/react/primary/CheckBox";
import { Button, ButtonTheme } from "@/components/react/primary/Button";
import { deactivateAdminUser, updateAdminUser } from "@/lib/services/admin/admin.service";
import { getSpecialtiesSelect } from "@/lib/services/medical/specialty/specialty.service";

import type { User, UserStatus } from "@/types/User";

type RoleOption = { value: number; label: string };

type UserDraft = {
    ci: string;
    name: string;
    roleId: number | "";
    specialtyId: number | "";
    password: string;
    status: UserStatus;
};

export default function EditUserModalTrigger({
    user,
    roleOptions = [],
    onUpdated,
}: {
    user: User;
    roleOptions?: RoleOption[];
    onUpdated?: () => void;
}) {
    const initialDraft: UserDraft = {
        ci: user.ci,
        name: user.name,
        roleId: user.roleId ?? "",
        specialtyId: user.doctor?.specialtyId ?? "",
        password: "",
        status: user.status,
    };
    const [draft, setDraft] = useState<UserDraft>(initialDraft);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [specialtyOptions, setSpecialtyOptions] = useState<SelectOption[]>([]);
    const [loadingSpecialties, setLoadingSpecialties] = useState(false);

    const selectRoleOptions: SelectOption[] = useMemo(
        () => roleOptions.map((role) => ({ value: role.value, label: role.label })),
        [roleOptions]
    );

    const set = <K extends keyof UserDraft>(key: K, value: UserDraft[K]) => {
        setDraft((prev) => ({ ...prev, [key]: value }));
    };

    const selectedRole = roleOptions.find((role) => role.value === draft.roleId);
    const isDoctor = selectedRole?.label.toUpperCase().includes("DOCTOR") ?? false;

    useEffect(() => {
        let mounted = true;

        if (!isDoctor) {
            setDraft((prev) => ({ ...prev, specialtyId: "" }));
            setSpecialtyOptions([]);
            return;
        }

        (async () => {
            try {
                setLoadingSpecialties(true);
                const specialties = await getSpecialtiesSelect();

                if (!mounted) return;

                setSpecialtyOptions(
                    specialties.map((specialty) => ({
                        value: specialty.id,
                        label: specialty.name,
                    }))
                );
            } catch {
                if (mounted) {
                    setSpecialtyOptions([]);
                }
            } finally {
                if (mounted) {
                    setLoadingSpecialties(false);
                }
            }
        })();

        return () => {
            mounted = false;
        };
    }, [isDoctor]);

    return (
        <ModalTrigger
            buttonLabel="Editar"
            buttonTheme={ButtonTheme.SECONDARY}
            modalTitle={`Editar usuario - ${user.name}`}
        >
            {({ close }) => (
                <form
                    className="space-y-4"
                    onSubmit={async (e) => {
                        e.preventDefault();

                        setError(null);
                        setLoading(true);
                        try {
                            if (draft.status === "INACTIVO" && user.status !== "INACTIVO") {
                                await deactivateAdminUser(user.id);
                            } else {
                                await updateAdminUser(user.id, {
                                    ci: draft.ci,
                                    name: draft.name,
                                    roleId: Number(draft.roleId),
                                    specialtyId: isDoctor ? Number(draft.specialtyId) : undefined,
                                    password: draft.password || undefined,
                                });
                            }

                            close();
                            onUpdated?.();
                        } catch (err) {
                            setError(err instanceof Error ? err.message : "No se pudo actualizar el usuario");
                        } finally {
                            setLoading(false);
                        }
                    }}
                >
                    {error ? (
                        <div className="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">
                            {error}
                        </div>
                    ) : null}

                    <Field
                        label="Cédula"
                        name="ci"
                        placeholder="Ej: 12345678"
                        value={draft.ci}
                        onChange={(e) => set("ci", e.target.value)}
                        required
                    />

                    <Field
                        label="Nombre completo"
                        name="name"
                        placeholder="Ej: Juan Pérez"
                        value={draft.name}
                        onChange={(e) => set("name", e.target.value)}
                        required
                    />

                    <Field
                        label="Contraseña (opcional)"
                        name="password"
                        type="password"
                        placeholder="Dejar en blanco para mantener"
                        value={draft.password}
                        onChange={(e) => set("password", e.target.value)}
                    />

                    <Select
                        label="Rol"
                        name="roleId"
                        options={selectRoleOptions}
                        placeholder="Selecciona un rol"
                        value={draft.roleId}
                        onChange={(v) => set("roleId", Number(v))}
                        required
                    />

                    {isDoctor ? (
                        <Select
                            label="Especialidad"
                            name="specialtyId"
                            options={specialtyOptions}
                            placeholder={loadingSpecialties ? "Cargando especialidades..." : "Selecciona una especialidad"}
                            value={draft.specialtyId}
                            onChange={(v) => set("specialtyId", Number(v))}
                            required
                        />
                    ) : null}

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
                                    setError(null);
                                }}
                            />
                            <Button label="Guardar cambios" type="submit" loading={loading} />
                        </div>
                    </div>
                </form>
            )}
        </ModalTrigger>
    );
}
