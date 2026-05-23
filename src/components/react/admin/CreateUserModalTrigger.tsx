import { useEffect, useMemo, useState } from "react";
import { ModalTrigger } from "@/components/react/primary/ModalTrigger";
import { Field } from "@/components/react/primary/Field";
import { Select, type SelectOption } from "@/components/react/primary/Select";
import { Button, ButtonTheme } from "@/components/react/primary/Button";
import { createAdminUser } from "@/lib/services/admin/admin.service";
import { getSpecialtiesSelect } from "@/lib/services/medical/specialty/specialty.service";

type RoleOption = { value: number; label: string };

type UserDraft = {
    ci: string;
    name: string;
    roleId: number | "";
    specialtyId: number | "";
    password: string;
};

const emptyDraft = (): UserDraft => ({
    ci: "",
    name: "",
    roleId: "",
    specialtyId: "",
    password: "",
});

export default function CreateUserModalTrigger({
    roleOptions = [],
    onCreated,
}: {
    roleOptions?: RoleOption[];
    onCreated?: () => void;
}) {
    const [draft, setDraft] = useState<UserDraft>(emptyDraft);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [specialtyOptions, setSpecialtyOptions] = useState<SelectOption[]>([]);
    const [loadingSpecialties, setLoadingSpecialties] = useState(false);

    const selectRoleOptions: SelectOption[] = useMemo(
        () => roleOptions.map((option) => ({ value: option.value, label: option.label })),
        [roleOptions]
    );

    const set = <K extends keyof UserDraft>(key: K, value: UserDraft[K]) => {
        setDraft((prev) => ({ ...prev, [key]: value }));
    };

    const selectedRole = roleOptions.find((option) => option.value === draft.roleId);
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
            buttonLabel="Agregar usuario"
            buttonTheme={ButtonTheme.PRIMARY}
            modalTitle="Crear nuevo usuario"
        >
            {({ close }) => (
                <form
                    className="space-y-4 w-full"
                    onSubmit={async (e) => {
                        e.preventDefault();

                        setError(null);
                        setLoading(true);
                        try {
                            await createAdminUser({
                                ci: draft.ci,
                                name: draft.name,
                                password: draft.password,
                                roleId: Number(draft.roleId),
                                specialtyId: isDoctor ? Number(draft.specialtyId) : undefined,
                            });

                            close();
                            setDraft(emptyDraft());
                            onCreated?.();
                        } catch (err) {
                            setError(err instanceof Error ? err.message : "No se pudo crear el usuario");
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
                        label="Contraseña"
                        name="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={draft.password}
                        onChange={(e) => set("password", e.target.value)}
                        required
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

                    <div className="flex gap-3 shrink-0 ml-auto pt-2 justify-end">
                        <Button
                            label="Cancelar"
                            variant={ButtonTheme.SECONDARY}
                            type="button"
                            onClick={() => {
                                close();
                                setDraft(emptyDraft());
                                setError(null);
                            }}
                        />
                        <Button label="Guardar" type="submit" loading={loading} />
                    </div>
                </form>
            )}
        </ModalTrigger>
    );
}
