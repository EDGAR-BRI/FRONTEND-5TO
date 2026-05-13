import { useEffect, useMemo, useState } from "react";
import { FaUsers, FaMoneyBillWave, FaPlus, FaUserShield } from "react-icons/fa6";
import { StatsCard } from "@/components/react/primary/StatsCard";
import { Field } from "@/components/react/primary/Field";
import { DataTable, type Column } from "@/components/react/primary/DataTable";
import { ModalTrigger } from "@/components/react/primary/ModalTrigger";
import { Button, ButtonTheme } from "@/components/react/primary/Button";
import { Alert } from "@/utils/alerts";
import { createAdminRole, deleteAdminRole, listAdminRoles, updateAdminRole, type RoleDto } from "@/lib/services/admin/admin.service";

const money = (value?: number | string | null) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value ?? 0));

function RoleForm({ role, onSaved, close }: { role?: RoleDto; onSaved: () => void; close: () => void }) {
    const [name, setName] = useState(role?.name ?? "");
    const [code, setCode] = useState(role?.code ?? "");
    const [baseSalary, setBaseSalary] = useState(String(role?.base_salary ?? ""));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setName(role?.name ?? "");
        setCode(role?.code ?? "");
        setBaseSalary(String(role?.base_salary ?? ""));
    }, [role]);

    return (
        <form className="space-y-4" onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            try {
                const payload = { name, code, base_salary: baseSalary ? Number(baseSalary) : undefined };
                if (role) {
                    await updateAdminRole(role.id, payload);
                    await Alert.success("Rol actualizado", "Se guardaron los cambios");
                } else {
                    await createAdminRole(payload);
                    await Alert.success("Rol creado", "Se registró correctamente");
                }
                close();
                onSaved();
            } catch (err) {
                setError(err instanceof Error ? err.message : "No se pudo guardar el rol");
            } finally {
                setLoading(false);
            }
        }}>
            {error ? <div className="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">{error}</div> : null}
            <Field label="Nombre" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Field label="Código" name="code" value={code} onChange={(e) => setCode(e.target.value)} required />
            <Field label="Sueldo base" name="base_salary" type="number" step="0.01" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} />
            <div className="flex items-center justify-end gap-3 pt-2">
                <Button label="Cancelar" variant={ButtonTheme.SECONDARY} type="button" onClick={close} />
                <Button label={role ? "Guardar cambios" : "Crear"} type="submit" loading={loading} />
            </div>
        </form>
    );
}

export default function RolesSalariesDashboard() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [items, setItems] = useState<RoleDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(handler);
    }, [search]);

    const reload = async () => {
        setIsLoading(true);
        try {
            setItems(await listAdminRoles());
        } catch {
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { void reload(); }, []);

    const filtered = items.filter((item) => {
        const term = debouncedSearch.trim().toLowerCase();
        return !term || item.name.toLowerCase().includes(term) || item.code.toLowerCase().includes(term);
    });

    const stats = useMemo(() => ({ total: items.length, salaried: items.filter((r) => Number(r.base_salary ?? 0) > 0).length }), [items]);

    const columns: Column<RoleDto>[] = [
        { header: "ID", accessorKey: "id" },
        { header: "Nombre", accessorKey: "name" },
        { header: "Código", accessorKey: "code" },
        { header: "Sueldo base", align: "right", cell: (item) => money(item.base_salary) !== "$0.00" ? money(item.base_salary) : "Sin sueldo" },
        {
            header: "Acciones",
            align: "center",
            cell: (item) => (
                <div className="flex justify-center gap-3">
                    <ModalTrigger modalTitle="Editar rol" trigger={<button className="text-primary-700 hover:text-primary-900 text-sm font-medium">Editar</button>}>
                        {({ close }) => <RoleForm role={item} onSaved={reload} close={close} />}
                    </ModalTrigger>
                    <button className="text-error hover:text-red-700 text-sm font-medium" onClick={async () => {
                        const confirmed = await Alert.confirm("Eliminar rol", `¿Eliminar ${item.name}?`);
                        if (!confirmed) return;
                        await deleteAdminRole(item.id);
                        await reload();
                    }}>Eliminar</button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatsCard title="Roles" value={stats.total} color="primary" icon={<FaUsers size={18} />} variant="compact" />
                <StatsCard title="Con sueldo" value={stats.salaried} color="success" icon={<FaMoneyBillWave size={18} />} variant="compact" />
                <StatsCard title="Búsqueda" value={search.trim() ? "Activa" : "Total"} color="primary" icon={<FaPlus size={18} />} variant="compact" />
            </div>

            <section className="bg-primary-700 rounded-lg border border-primary-400 overflow-hidden shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 shrink-0 rounded-lg bg-white/10 flex items-center justify-center">
                            <FaUserShield size={18} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-semibold text-white leading-tight">Roles y Sueldos</h2>
                            <p className="text-xs text-primary-200 mt-0.5">Administra roles del sistema y su sueldo base.</p>
                        </div>
                    </div>
                    <ModalTrigger modalTitle="Crear rol" buttonLabel="Nuevo rol">
                        {({ close }) => <RoleForm onSaved={reload} close={close} />}
                    </ModalTrigger>
                </div>
                <div className="px-6 py-3 flex flex-wrap gap-3 items-center bg-white/5 border-b border-primary-400/30">
                    <div className="relative flex-1 min-w-50 max-w-sm">
                        <Field name="search" placeholder="Buscar por nombre o código..." value={search} onChange={(e) => setSearch(e.target.value)} className="outline-none! ring-0! border-transparent! focus:outline-none! focus:ring-0! focus:border-transparent!" />
                    </div>
                </div>
                <DataTable<RoleDto> className="rounded-none! border-none!" endpoint="" data={filtered} columns={columns} isLoading={isLoading} />
            </section>
        </div>
    );
}
