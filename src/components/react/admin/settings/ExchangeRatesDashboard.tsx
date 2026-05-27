import { useEffect, useMemo, useState } from "react";
import { FaArrowsRotate, FaDollarSign, FaPlus, FaTriangleExclamation } from "react-icons/fa6";
import { StatsCard } from "@/components/react/primary/StatsCard";
import { Field } from "@/components/react/primary/Field";
import { DataTable, type Column } from "@/components/react/primary/DataTable";
import { ModalTrigger } from "@/components/react/primary/ModalTrigger";
import { Button, ButtonTheme } from "@/components/react/primary/Button";
import { Alert } from "@/utils/alerts";
import { createExchangeRate, getExchangeRates, syncBcvRate, updateExchangeRate, type ExchangeRate } from "@/lib/services/finance/exchange-rate/exchange_rate.service";

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
const formatDate = (value: string) => new Date(value).toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" });

function ExchangeRateForm({ rateItem, onSaved, close }: { rateItem?: ExchangeRate; onSaved: () => void; close: () => void }) {
    const [rate, setRate] = useState(rateItem ? String(rateItem.rate) : "");
    const [isActive, setIsActive] = useState(rateItem?.is_active ?? true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setRate(rateItem ? String(rateItem.rate) : "");
        setIsActive(rateItem?.is_active ?? true);
    }, [rateItem]);

    return (
        <form className="space-y-4" onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            try {
                if (rateItem) {
                    await updateExchangeRate(rateItem.id, { rate: Number(rate), is_active: isActive });
                    await Alert.success("Tasa actualizada", "Se guardaron los cambios");
                } else {
                    await createExchangeRate({ rate: Number(rate), is_active: true });
                    await Alert.success("Tasa creada", "Se registró correctamente");
                }
                close();
                onSaved();
            } catch (err) {
                setError(err instanceof Error ? err.message : "No se pudo guardar la tasa de cambio");
            } finally {
                setLoading(false);
            }
        }}>
            {error ? <div className="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">{error}</div> : null}
            <Field label="Tasa USD" name="rate" type="number" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} required />
            {rateItem ? (
                <label className="flex items-center gap-2 text-sm text-primary-700">
                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                    Marcar como activa
                </label>
            ) : null}
            <div className="flex items-center justify-end gap-3 pt-2">
                <Button label="Cancelar" variant={ButtonTheme.SECONDARY} type="button" onClick={close} />
                <Button label={rateItem ? "Guardar cambios" : "Crear"} type="submit" loading={loading} />
            </div>
        </form>
    );
}

export default function ExchangeRatesDashboard() {
    const [items, setItems] = useState<ExchangeRate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    const reload = async () => {
        setIsLoading(true);
        try {
            setItems(await getExchangeRates());
        } catch {
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { void reload(); }, []);

    const active = items.find((item) => item.is_active) ?? items[0];
    const stats = useMemo(() => ({ total: items.length, active: active?.rate ?? 0 }), [items, active]);

    const columns: Column<ExchangeRate>[] = [
        { header: "ID", accessorKey: "id" },
        { header: "Tasa", align: "center", cell: (item) => money(item.rate) },
        { header: "Fecha", cell: (item) => formatDate(item.createdAt) },
        { header: "Activa", cell: (item) => (item.is_active ? "Sí" : "No") },
        {
            header: "Acciones",
            align: "center",
            cell: (item) => (
                <div className="flex justify-center gap-3">
                    {/* <ModalTrigger modalTitle="Editar tasa de cambio" trigger={<button className="text-primary-700 hover:text-primary-900 text-sm font-medium">Editar</button>}>
                        {({ close }) => <ExchangeRateForm rateItem={item} onSaved={reload} close={close} />}
                    </ModalTrigger> */}
                    <button className="text-error hover:text-red-700 text-sm font-medium" onClick={async () => {
                        const confirmed = await Alert.confirm(`${item.is_active ? "Eliminar tasa" : 'Reactivar tasa'}`, (item.is_active ? `¿Eliminar la tasa ${item.rate}?` : `Reactivar la tasa ${item.rate}?`));
                        if (!confirmed) return;
                        await updateExchangeRate(item.id, {is_active: !item.is_active});
                        await reload();
                    }}>{item.is_active ? 'Eliminar' : 'Reactivar'}</button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Tasas" value={stats.total} color="primary" icon={<FaArrowsRotate size={18} />} variant="compact" />
                <StatsCard title="Tasa activa" value={money(stats.active)} color="success" icon={<FaDollarSign size={18} />} variant="compact" />
                <StatsCard title="Estado" value={active?.is_active ? "Activa" : "Sin tasa"} color="warning" icon={<FaTriangleExclamation size={18} />} variant="compact" />
                <StatsCard title="Nueva" value="Disponible" color="primary" icon={<FaPlus size={18} />} variant="compact" />
            </div>

            <section className="bg-primary-700 rounded-lg border border-primary-400 overflow-hidden shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 shrink-0 rounded-lg bg-white/10 flex items-center justify-center">
                            <FaArrowsRotate size={18} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-semibold text-white leading-tight">Tasas de Cambio</h2>
                            <p className="text-xs text-primary-200 mt-0.5">Registro histórico y activación de la tasa vigente.</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            label={isSyncing ? "Actualizando..." : "Refrescar BCV"}
                            variant={ButtonTheme.SECONDARY}
                            loading={isSyncing}
                            onClick={async () => {
                                if (isSyncing) return;
                                setIsSyncing(true);
                                try {
                                    const result = await syncBcvRate();
                                    await reload();
                                    if (result.changed) {
                                        await Alert.success("Tasa actualizada", `Nueva tasa BCV: ${Number(result.rate?.rate ?? 0).toFixed(4)} Bs`);
                                    } else {
                                        await Alert.info("Sin cambios", "La tasa BCV sigue igual.");
                                    }
                                } catch (err) {
                                    await Alert.error("No se pudo actualizar", err instanceof Error ? err.message : "Error desconocido");
                                } finally {
                                    setIsSyncing(false);
                                }
                            }}
                        />
                        <ModalTrigger modalTitle="Crear tasa de cambio" buttonLabel="Nueva tasa">
                            {({ close }) => <ExchangeRateForm onSaved={reload} close={close} />}
                        </ModalTrigger>
                    </div>
                </div>

                <DataTable<ExchangeRate> className="rounded-none! border-none!" endpoint="" data={items} columns={columns} isLoading={isLoading} />
            </section>
        </div>
    );
}
