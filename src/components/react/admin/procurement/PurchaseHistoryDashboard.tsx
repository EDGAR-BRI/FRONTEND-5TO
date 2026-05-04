import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DataTable, type Column } from "@/components/react/primary/DataTable";
import { Badge } from "@/components/react/primary/Badge";
import { StatsCard } from "@/components/react/primary/StatsCard";
import { listPurchases } from "@/lib/services/procurement/purchase/purchase.service";
import type { PurchaseHistoryRecord, PurchaseStatus } from "@/lib/services/procurement/purchase/purchase.interface";
import {
    FaBoxesStacked,
    FaClock,
    FaFileInvoiceDollar,
    FaMagnifyingGlass,
    FaReceipt,
    FaRotateRight,
    FaArrowRight,
    FaCircleCheck,
    FaCircleXmark,
    FaHourglassHalf,
    FaTruck,
    FaSackDollar,
    FaXmark,
} from "react-icons/fa6";

const money = (value: number, currency = "USD") =>
    new Intl.NumberFormat("es-VE", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));

const statusConfig: Record<PurchaseStatus, { label: string; bg: string; text: string; icon: ReactNode }> = {
    COMPLETED: { label: "Completada", bg: "bg-green-50", text: "text-green-700", icon: <FaCircleCheck size={12} /> },
    PENDING: { label: "Pendiente", bg: "bg-yellow-50", text: "text-yellow-700", icon: <FaHourglassHalf size={12} /> },
    CANCELLED: { label: "Cancelada", bg: "bg-gray-100", text: "text-gray-700", icon: <FaCircleXmark size={12} /> },
    ANULLED: { label: "Anulada", bg: "bg-red-50", text: "text-red-700", icon: <FaCircleXmark size={12} /> },
};

const normalizeStatus = (status?: string | null): PurchaseStatus => {
    const raw = (status || "PENDING").toUpperCase();
    if (raw in statusConfig) return raw as PurchaseStatus;
    return "PENDING";
};

const paymentTotals = (purchase: PurchaseHistoryRecord) => ({
    usd: purchase.payments.reduce((sum, payment) => sum + (payment.currency === "USD" ? Number(payment.amount || 0) : 0), 0),
    ves: purchase.payments.reduce((sum, payment) => sum + (payment.currency === "VES" ? Number(payment.amount || 0) : 0), 0),
});

export const PurchaseHistoryDashboard = () => {
    const { data, error, isLoading, mutate } = useSWR<PurchaseHistoryRecord[]>("purchase-history", listPurchases);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | PurchaseStatus>("ALL");
    const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const purchases = data ?? [];

    const filteredPurchases = useMemo(() => {
        const term = search.trim().toLowerCase();

        return purchases.filter((purchase) => {
            const purchaseStatus = normalizeStatus(purchase.status);
            if (statusFilter !== "ALL" && purchaseStatus !== statusFilter) return false;

            if (!term) return true;

            const haystack = [
                purchase.id,
                purchase.reference,
                purchase.observation,
                purchase.supplier?.name,
                purchase.supplier?.contact,
                purchase.user?.name,
                purchase.user?.ci,
                purchase.items.map((item) => item.supply?.name).join(" "),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return haystack.includes(term);
        });
    }, [purchases, search, statusFilter]);

    useEffect(() => {
        if (filteredPurchases.length === 0) {
            setSelectedPurchaseId(null);
            setIsPanelOpen(false);
            return;
        }

        const stillVisible = filteredPurchases.some((purchase) => purchase.id === selectedPurchaseId);
        if (!selectedPurchaseId || !stillVisible) {
            setSelectedPurchaseId(filteredPurchases[0].id);
        }
    }, [filteredPurchases, selectedPurchaseId]);

    useEffect(() => {
        if (!selectedPurchaseId && filteredPurchases.length > 0) {
            setSelectedPurchaseId(filteredPurchases[0].id);
        }
    }, [filteredPurchases, selectedPurchaseId]);

    useEffect(() => {
        if (!isPanelOpen) return;

        const previousBodyOverflow = document.body.style.overflow;
        const previousHtmlOverflow = document.documentElement.style.overflow;

        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow = previousHtmlOverflow;
        };
    }, [isPanelOpen]);

    const selectedPurchase = useMemo(
        () => filteredPurchases.find((purchase) => purchase.id === selectedPurchaseId) ?? filteredPurchases[0] ?? null,
        [filteredPurchases, selectedPurchaseId]
    );

    const stats = useMemo(() => {
        const totalUsd = purchases.reduce((sum, purchase) => sum + Number(purchase.total_usd || 0), 0);
        const totalBs = purchases.reduce((sum, purchase) => sum + Number(purchase.total_bs || 0), 0);

        return {
            totalPurchases: purchases.length,
            totalUsd,
            totalBs,
            completed: purchases.filter((purchase) => normalizeStatus(purchase.status) === "COMPLETED").length,
            pending: purchases.filter((purchase) => normalizeStatus(purchase.status) === "PENDING").length,
            cancelled: purchases.filter((purchase) => ["CANCELLED", "ANULLED"].includes(normalizeStatus(purchase.status))).length,
        };
    }, [purchases]);

    const columns: Column<PurchaseHistoryRecord>[] = useMemo(() => [
        {
            header: "COMPRA",
            accessorKey: "id",
            cell: (purchase) => (
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-primary-900">#{purchase.id}</span>
                    <span className="text-xs text-cool-gray-50">
                        {purchase.reference ? purchase.reference : "Sin referencia"}
                    </span>
                    <span className="text-xs text-cool-gray-50">
                        {purchase.date ? format(new Date(purchase.date), "dd MMM yyyy · HH:mm", { locale: es }) : "Sin fecha"}
                    </span>
                </div>
            ),
        },
        {
            header: "PROVEEDOR / USUARIO",
            accessorKey: "supplierId",
            cell: (purchase) => (
                <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-medium text-cool-gray-90 truncate">{purchase.supplier?.name ?? "Sin proveedor"}</span>
                    <span className="text-xs text-cool-gray-50 truncate">
                        {purchase.user?.name ?? "Sin usuario"} · CI {purchase.user?.ci ?? "N/A"}
                    </span>
                </div>
            ),
        },
        {
            header: "ESTADO",
            accessorKey: "status",
            cell: (purchase) => {
                const config = statusConfig[normalizeStatus(purchase.status)];

                return (
                    <Badge
                        styles={{
                            bg: config.bg,
                            text: config.text,
                            border: "border-transparent",
                            rounded: "rounded-full",
                            padding: "px-2.5 py-1",
                        }}
                    >
                        <span className="flex items-center gap-1.5">
                            {config.icon}
                            {config.label}
                        </span>
                    </Badge>
                );
            },
        },
        {
            header: "TOTALES",
            accessorKey: "total_usd",
            cell: (purchase) => (
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-cool-gray-90">{money(purchase.total_usd)}</span>
                    <span className="text-xs text-cool-gray-50">Bs. {money(purchase.total_bs, "VES")}</span>
                </div>
            ),
        },
        {
            header: "DETALLE",
            accessorKey: "items",
            cell: (purchase) => {
                const totals = paymentTotals(purchase);
                const balance = Number(purchase.total_usd || 0) - totals.usd;

                return (
                    <div className="flex flex-col gap-1 text-xs text-cool-gray-60">
                        <span>{purchase.items.length} insumos · {purchase.payments.length} pagos</span>
                        <span>{money(balance)} por cubrir</span>
                    </div>
                );
            },
        },
        {
            header: "ACCIONES",
            accessorKey: "id",
            align: "right",
            cell: (purchase) => (
                <button
                    type="button"
                    onClick={() => {
                        setSelectedPurchaseId(purchase.id);
                        setIsPanelOpen(true);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-primary-200 bg-white px-3 py-2 text-xs font-semibold text-primary-700 hover:border-primary-400 hover:bg-primary-50 transition-colors"
                >
                    Ver detalle
                    <FaArrowRight size={11} />
                </button>
            ),
        },
    ], []);

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                No se pudo cargar el historial de compras.
                <button
                    type="button"
                    onClick={() => mutate()}
                    className="ml-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-white hover:bg-red-700 transition-colors"
                >
                    Reintentar
                    <FaRotateRight size={12} />
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatsCard
                    title="Compras registradas"
                    value={stats.totalPurchases}
                    color="primary"
                    icon={<FaReceipt size={18} />}
                    variant="compact"
                />
                <StatsCard
                    title="Total USD"
                    value={money(stats.totalUsd)}
                    color="success"
                    icon={<FaSackDollar size={18} />}
                    variant="compact"
                />
                <StatsCard
                    title="Total Bs"
                    value={money(stats.totalBs, "VES")}
                    color="primary"
                    icon={<FaFileInvoiceDollar size={18} />}
                    variant="compact"
                />
                <StatsCard
                    title="Pendientes / anuladas"
                    value={`${stats.pending} / ${stats.cancelled}`}
                    color="warning"
                    icon={<FaClock size={18} />}
                    variant="compact"
                />
            </div>

            <section className="space-y-4">
                <div className="rounded-2xl border border-primary-200 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
                    <div className="flex flex-col gap-4 border-b border-primary-200 bg-primary-50/70 px-5 py-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                            <h2 className="text-lg font-semibold text-primary-900">Historial de compras</h2>
                            <p className="text-sm text-cool-gray-60">
                                Compras de insumos con proveedor, pagos, impuestos y detalle por ítem.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => mutate()}
                                className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-white px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 transition-colors"
                            >
                                <FaRotateRight size={13} />
                                Actualizar
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 border-b border-primary-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                        <label className="relative block w-full lg:max-w-md">
                            <span className="sr-only">Buscar compras</span>
                            <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cool-gray-40" size={14} />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Buscar por proveedor, referencia, usuario o insumo"
                                className="w-full rounded-xl border border-primary-200 bg-white py-2.5 pl-9 pr-4 text-sm text-cool-gray-90 outline-none transition-colors placeholder:text-cool-gray-40 focus:border-primary-400"
                            />
                        </label>

                        <div className="flex flex-wrap gap-2">
                            {(["ALL", "COMPLETED", "PENDING", "CANCELLED", "ANULLED"] as const).map((value) => {
                                const labelMap: Record<typeof value, string> = {
                                    ALL: "Todas",
                                    COMPLETED: "Completadas",
                                    PENDING: "Pendientes",
                                    CANCELLED: "Canceladas",
                                    ANULLED: "Anuladas",
                                };

                                const isActive = statusFilter === value;

                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setStatusFilter(value)}
                                        className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                                            isActive
                                                ? "border-primary-500 bg-primary-500 text-white"
                                                : "border-primary-200 bg-white text-primary-700 hover:bg-primary-50"
                                        }`}
                                    >
                                        {labelMap[value]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <DataTable<PurchaseHistoryRecord>
                        className="rounded-none! border-none!"
                        endpoint=""
                        data={filteredPurchases}
                        columns={columns}
                        isLoading={isLoading}
                    />
                </div>
            </section>
            </div>

            <div
                className={`fixed inset-0 z-40 transition ${isPanelOpen ? "pointer-events-auto" : "pointer-events-none"}`}
                aria-hidden={!isPanelOpen}
            >
                <button
                    type="button"
                    aria-label="Cerrar panel de detalle"
                    onClick={() => setIsPanelOpen(false)}
                    className={`absolute inset-0 bg-cool-gray-90/50 backdrop-blur-[2px] transition-opacity duration-300 ${
                        isPanelOpen ? "opacity-100" : "opacity-0"
                    }`}
                />

                <aside
                    className={`absolute right-0 top-0 flex h-full w-full max-w-[min(92vw,32rem)] flex-col border-l border-primary-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${
                        isPanelOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="purchase-detail-title"
                >
                    {selectedPurchase ? (
                        <>
                            <div className="flex items-start justify-between gap-4 border-b border-primary-200 bg-primary-50 px-5 py-4">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">Detalle de compra</p>
                                    <h3 id="purchase-detail-title" className="text-lg font-semibold text-primary-900">
                                        Compra #{selectedPurchase.id}
                                    </h3>
                                    <p className="text-sm text-cool-gray-60">{selectedPurchase.reference || "Sin referencia"}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsPanelOpen(false)}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary-200 bg-white text-primary-700 hover:bg-primary-50 transition-colors"
                                    aria-label="Cerrar detalle"
                                >
                                    <FaXmark size={14} />
                                </button>
                            </div>

                            <div className="flex-1 space-y-5 overflow-y-auto p-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div className="rounded-xl border border-primary-100 bg-primary-50/70 p-3">
                                        <p className="text-xs uppercase tracking-wide text-cool-gray-50">Proveedor</p>
                                        <p className="mt-1 font-semibold text-primary-900">{selectedPurchase.supplier?.name ?? "Sin proveedor"}</p>
                                        <p className="text-xs text-cool-gray-60">{selectedPurchase.supplier?.contact ?? "Sin contacto"}</p>
                                    </div>
                                    <div className="rounded-xl border border-primary-100 bg-primary-50/70 p-3">
                                        <p className="text-xs uppercase tracking-wide text-cool-gray-50">Usuario</p>
                                        <p className="mt-1 font-semibold text-primary-900">{selectedPurchase.user?.name ?? "Sin usuario"}</p>
                                        <p className="text-xs text-cool-gray-60">CI {selectedPurchase.user?.ci ?? "N/A"}</p>
                                    </div>
                                    <div className="rounded-xl border border-primary-100 bg-primary-50/70 p-3">
                                        <p className="text-xs uppercase tracking-wide text-cool-gray-50">Fecha</p>
                                        <p className="mt-1 font-semibold text-primary-900">
                                            {selectedPurchase.date ? format(new Date(selectedPurchase.date), "dd MMM yyyy", { locale: es }) : "Sin fecha"}
                                        </p>
                                        <p className="text-xs text-cool-gray-60">
                                            {selectedPurchase.date ? format(new Date(selectedPurchase.date), "HH:mm") : ""}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-primary-100 bg-primary-50/70 p-3">
                                        <p className="text-xs uppercase tracking-wide text-cool-gray-50">Tasa activa</p>
                                        <p className="mt-1 font-semibold text-primary-900">
                                            {selectedPurchase.exchangeRate?.rate ? money(selectedPurchase.exchangeRate.rate, "VES") : "Sin tasa"}
                                        </p>
                                        <p className="text-xs text-cool-gray-60">1 USD = Bs. {selectedPurchase.exchangeRate?.rate ?? 0}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <StatsCard
                                        title="Total USD"
                                        value={money(selectedPurchase.total_usd)}
                                        color="success"
                                        icon={<FaSackDollar size={16} />}
                                        variant="compact"
                                    />
                                    <StatsCard
                                        title="Total Bs"
                                        value={money(selectedPurchase.total_bs, "VES")}
                                        color="primary"
                                        icon={<FaFileInvoiceDollar size={16} />}
                                        variant="compact"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="rounded-xl border border-primary-100 p-3">
                                        <p className="text-xs text-cool-gray-50">IVA USD</p>
                                        <p className="mt-1 font-semibold text-primary-900">{money(selectedPurchase.iva_usd)}</p>
                                    </div>
                                    <div className="rounded-xl border border-primary-100 p-3">
                                        <p className="text-xs text-cool-gray-50">IVA Bs</p>
                                        <p className="mt-1 font-semibold text-primary-900">{money(selectedPurchase.iva_bs, "VES")}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-primary-900">
                                        <FaBoxesStacked size={14} />
                                        Insumos ({selectedPurchase.items.length})
                                    </div>
                                    <div className="space-y-2">
                                        {selectedPurchase.items.map((item) => (
                                            <div key={item.id} className="rounded-xl border border-primary-100 bg-primary-50/50 p-3 text-sm">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-semibold text-primary-900">{item.supply?.name ?? "Insumo"}</p>
                                                        <p className="text-xs text-cool-gray-60">
                                                            Cantidad: {item.quantity} · Costo unitario: {money(item.unit_cost)}
                                                        </p>
                                                    </div>
                                                    <p className="font-semibold text-primary-700">
                                                        {money(Number(item.quantity || 0) * Number(item.unit_cost || 0))}
                                                    </p>
                                                </div>
                                                <p className="mt-2 text-xs text-cool-gray-60">
                                                    SKU: {item.supply?.sku ?? "N/A"} · Vence: {item.expiration_date ? format(new Date(item.expiration_date), "dd MMM yyyy", { locale: es }) : "Sin vencimiento"}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-primary-900">
                                        <FaTruck size={14} />
                                        Pagos ({selectedPurchase.payments.length})
                                    </div>
                                    <div className="space-y-2">
                                        {selectedPurchase.payments.map((payment) => (
                                            <div key={payment.id} className="rounded-xl border border-primary-100 p-3 text-sm">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-semibold text-primary-900">{payment.paymentMethod?.name ?? "Método de pago"}</p>
                                                        <p className="text-xs text-cool-gray-60">
                                                            {payment.currency} · {payment.reference || "Sin referencia"}
                                                        </p>
                                                    </div>
                                                    <p className="font-semibold text-primary-700">
                                                        {money(Number(payment.amount || 0), payment.currency === "VES" ? "VES" : "USD")}
                                                    </p>
                                                </div>
                                                <p className="mt-2 text-xs text-cool-gray-60">
                                                    {payment.payment_date ? format(new Date(payment.payment_date), "dd MMM yyyy · HH:mm", { locale: es }) : "Sin fecha de pago"}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {selectedPurchase.observation && (
                                    <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-3 text-sm">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-cool-gray-50">Observación</p>
                                        <p className="mt-1 text-cool-gray-80">{selectedPurchase.observation}</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex h-full items-center justify-center p-6 text-sm text-cool-gray-60">
                            No hay una compra seleccionada.
                        </div>
                    )}
                </aside>
            </div>
        </>
    );
};