import { useEffect, useMemo, useState } from "react";
import { FaClipboardList, FaPlus, FaSyringe } from "react-icons/fa6";
import { StatsCard } from "@/components/react/primary/StatsCard";
import { Field } from "@/components/react/primary/Field";
import { DataTable, type Column } from "@/components/react/primary/DataTable";
import { ModalTrigger } from "@/components/react/primary/ModalTrigger";
import { Button, ButtonTheme } from "@/components/react/primary/Button";
import { Alert } from "@/utils/alerts";
import { createSymptom, deleteSymptom, getSymptoms, updateSymptom, type Symptom } from "@/lib/services/medical/symptoms/symptoms.service";

const moneyless = (value: number) => value.toString();

function SymptomForm({ symptom, onSaved, close }: { symptom?: Symptom; onSaved: () => void; close: () => void }) {
    const [name, setName] = useState(symptom?.name ?? "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setName(symptom?.name ?? "");
    }, [symptom]);

    return (
        <form
            className="space-y-4"
            onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                setLoading(true);
                try {
                    if (symptom) {
                        await updateSymptom(symptom.id, { name });
                        await Alert.success("Síntoma actualizado", "Se guardaron los cambios");
                    } else {
                        await createSymptom({ name });
                        await Alert.success("Síntoma creado", "Se registró correctamente");
                    }
                    close();
                    onSaved();
                } catch (err) {
                    setError(err instanceof Error ? err.message : "No se pudo guardar el síntoma");
                } finally {
                    setLoading(false);
                }
            }}
        >
            {error ? <div className="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">{error}</div> : null}
            <Field label="Nombre" name="name" placeholder="Ej: Fiebre" value={name} onChange={(e) => setName(e.target.value)} required />
            <div className="flex items-center justify-end gap-3 pt-2">
                <Button label="Cancelar" variant={ButtonTheme.SECONDARY} type="button" onClick={close} />
                <Button label={symptom ? "Guardar cambios" : "Crear"} type="submit" loading={loading} />
            </div>
        </form>
    );
}

export default function SymptomsDashboard() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [items, setItems] = useState<Symptom[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(handler);
    }, [search]);

    const reload = async () => {
        setIsLoading(true);
        try {
            setItems(await getSymptoms());
        } catch {
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { void reload(); }, []);

    const filtered = items.filter((item) => !debouncedSearch.trim() || item.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
    const stats = useMemo(() => ({ total: items.length }), [items]);

    const columns: Column<Symptom>[] = [
        { header: "ID", accessorKey: "id" },
        { header: "Nombre", accessorKey: "name" },
        {
            header: "Acciones",
            align: "center",
            cell: (item) => (
                <div className="flex justify-center gap-3">
                    <ModalTrigger
                        modalTitle="Editar síntoma"
                        trigger={<button className="text-primary-700 hover:text-primary-900 text-sm font-medium">Editar</button>}
                    >
                        {({ close }) => <SymptomForm symptom={item} onSaved={reload} close={close} />}
                    </ModalTrigger>
                    <button
                        className="text-error hover:text-red-700 text-sm font-medium"
                        onClick={async () => {
                            const confirmed = await Alert.confirm("Eliminar síntoma", `¿Eliminar ${item.name}?`);
                            if (!confirmed) return;
                            await deleteSymptom(item.id);
                            await reload();
                        }}
                    >
                        Eliminar
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Síntomas" value={stats.total} color="primary" icon={<FaSyringe size={18} />} variant="compact" />
                <StatsCard title="Filtrados" value={filtered.length} color="success" icon={<FaClipboardList size={18} />} variant="compact" />
                <StatsCard title="Búsqueda" value={search.trim() ? "Activa" : "Total"} color="primary" icon={<FaPlus size={18} />} variant="compact" />
                <StatsCard title="Registro" value={moneyless(items.length)} color="warning" icon={<FaClipboardList size={18} />} variant="compact" />
            </div>

            <section className="bg-primary-700 rounded-lg border border-primary-400 overflow-hidden shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 shrink-0 rounded-lg bg-white/10 flex items-center justify-center">
                            <FaSyringe size={18} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-semibold text-white leading-tight">Gestión de Síntomas</h2>
                            <p className="text-xs text-primary-200 mt-0.5">Catálogo de síntomas clínicos.</p>
                        </div>
                    </div>
                    <ModalTrigger modalTitle="Crear síntoma" buttonLabel="Nuevo síntoma">
                        {({ close }) => <SymptomForm onSaved={reload} close={close} />}
                    </ModalTrigger>
                </div>

                <div className="px-6 py-3 flex flex-wrap gap-3 items-center bg-white/5 border-b border-primary-400/30">
                    <div className="relative flex-1 min-w-50 max-w-sm">
                        <Field name="search" placeholder="Buscar por nombre..." value={search} onChange={(e) => setSearch(e.target.value)} className="outline-none! ring-0! border-transparent! focus:outline-none! focus:ring-0! focus:border-transparent!" />
                    </div>
                </div>

                <DataTable<Symptom> className="rounded-none! border-none!" endpoint="" data={filtered} columns={columns} isLoading={isLoading} />
            </section>
        </div>
    );
}
