import { useEffect, useMemo, useState } from "react";
import { FaClipboardList, FaFileMedical, FaPlus } from "react-icons/fa6";
import { StatsCard } from "@/components/react/primary/StatsCard";
import { Field } from "@/components/react/primary/Field";
import { DataTable, type Column } from "@/components/react/primary/DataTable";
import { ModalTrigger } from "@/components/react/primary/ModalTrigger";
import { Button, ButtonTheme } from "@/components/react/primary/Button";
import { Alert } from "@/utils/alerts";
import { createDiagnosis, deleteDiagnosis, getDiagnoses, updateDiagnosis, type Diagnosis } from "@/lib/services/medical/diagnosis/diagnosis.service";

function DiagnosisForm({ diagnosis, onSaved, close }: { diagnosis?: Diagnosis; onSaved: () => void; close: () => void }) {
    const [code, setCode] = useState(diagnosis?.code ?? "");
    const [description, setDescription] = useState(diagnosis?.description ?? "");
    const [category, setCategory] = useState(diagnosis?.category ?? "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setCode(diagnosis?.code ?? "");
        setDescription(diagnosis?.description ?? "");
        setCategory(diagnosis?.category ?? "");
    }, [diagnosis]);

    return (
        <form className="space-y-4" onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);
            try {
                if (diagnosis) {
                    await updateDiagnosis(diagnosis.id, { code, description, category });
                    await Alert.success("Diagnóstico actualizado", "Se guardaron los cambios");
                } else {
                    await createDiagnosis({ code, description, category });
                    await Alert.success("Diagnóstico creado", "Se registró correctamente");
                }
                close();
                onSaved();
            } catch (err) {
                setError(err instanceof Error ? err.message : "No se pudo guardar el diagnóstico");
            } finally {
                setLoading(false);
            }
        }}>
            {error ? <div className="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">{error}</div> : null}
            <Field label="Código" name="code" value={code} onChange={(e) => setCode(e.target.value)} required />
            <Field label="Descripción" name="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
            <Field label="Categoría" name="category" value={category} onChange={(e) => setCategory(e.target.value)} required />
            <div className="flex items-center justify-end gap-3 pt-2">
                <Button label="Cancelar" variant={ButtonTheme.SECONDARY} type="button" onClick={close} />
                <Button label={diagnosis ? "Guardar cambios" : "Crear"} type="submit" loading={loading} />
            </div>
        </form>
    );
}

export default function DiagnosesDashboard() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [items, setItems] = useState<Diagnosis[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(handler);
    }, [search]);

    const reload = async () => {
        setIsLoading(true);
        try {
            setItems(await getDiagnoses());
        } catch {
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { void reload(); }, []);

    const filtered = items.filter((item) => {
        const term = debouncedSearch.trim().toLowerCase();
        return !term || item.code.toLowerCase().includes(term) || item.description.toLowerCase().includes(term) || item.category.toLowerCase().includes(term);
    });

    const stats = useMemo(() => ({ total: items.length, filtered: filtered.length }), [items.length, filtered.length]);

    const columns: Column<Diagnosis>[] = [
        { header: "ID", accessorKey: "id" },
        { header: "Código", accessorKey: "code" },
        { header: "Descripción", accessorKey: "description" },
        { header: "Categoría", accessorKey: "category" },
        {
            header: "Acciones",
            align: "center",
            cell: (item) => (
                <div className="flex justify-center gap-3">
                    <ModalTrigger modalTitle="Editar diagnóstico" trigger={<button className="text-primary-700 hover:text-primary-900 text-sm font-medium">Editar</button>}>
                        {({ close }) => <DiagnosisForm diagnosis={item} onSaved={reload} close={close} />}
                    </ModalTrigger>
                    <button className="text-error hover:text-red-700 text-sm font-medium" onClick={async () => {
                        const confirmed = await Alert.confirm("Eliminar diagnóstico", `¿Eliminar ${item.code}?`);
                        if (!confirmed) return;
                        await deleteDiagnosis(item.id);
                        await reload();
                    }}>Eliminar</button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatsCard title="Diagnósticos" value={stats.total} color="primary" icon={<FaFileMedical size={18} />} variant="compact" />
                <StatsCard title="Filtrados" value={stats.filtered} color="success" icon={<FaClipboardList size={18} />} variant="compact" />
                <StatsCard title="Búsqueda" value={search.trim() ? "Activa" : "Total"} color="primary" icon={<FaPlus size={18} />} variant="compact" />
            </div>

            <section className="bg-primary-700 rounded-lg border border-primary-400 overflow-hidden shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 shrink-0 rounded-lg bg-white/10 flex items-center justify-center">
                            <FaFileMedical size={18} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-semibold text-white leading-tight">Gestión de Diagnósticos</h2>
                            <p className="text-xs text-primary-200 mt-0.5">Catálogo de códigos, descripciones y categorías.</p>
                        </div>
                    </div>
                    <ModalTrigger modalTitle="Crear diagnóstico" buttonLabel="Nuevo diagnóstico">
                        {({ close }) => <DiagnosisForm onSaved={reload} close={close} />}
                    </ModalTrigger>
                </div>
                <div className="px-6 py-3 flex flex-wrap gap-3 items-center bg-white/5 border-b border-primary-400/30">
                    <div className="relative flex-1 min-w-50 max-w-sm">
                        <Field name="search" placeholder="Buscar por código o descripción..." value={search} onChange={(e) => setSearch(e.target.value)} className="outline-none! ring-0! border-transparent! focus:outline-none! focus:ring-0! focus:border-transparent!" />
                    </div>
                </div>
                <DataTable<Diagnosis> className="rounded-none! border-none!" endpoint="" data={filtered} columns={columns} isLoading={isLoading} />
            </section>
        </div>
    );
}
