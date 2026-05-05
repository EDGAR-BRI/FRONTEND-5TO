import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DataTable, type Column } from "@/components/react/primary/DataTable";
import { Badge } from "@/components/react/primary/Badge";
import { StatsCard } from "@/components/react/primary/StatsCard";
import { listExpensePayments } from "@/lib/services/expenses/expensePayment/expensePayment.service";
import type { ExpensePaymentRecord } from "@/lib/services/expenses/expensePayment/expensePayment.interface";
import {
    FaBoxesStacked,
    FaClock,
    FaFileInvoiceDollar,
    FaMagnifyingGlass,
    FaReceipt,
    FaRotateRight,
    FaArrowRight,
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

export const PaidServicesHistoryDashboard = () => {
    const { data, error, isLoading, mutate } = useSWR<ExpensePaymentRecord[]>("paid-services-history", listExpensePayments);
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const records = data ?? [];

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        return records.filter((r) => {
            if (!term) return true;

            const haystack = [
                r.id,
                r.invoiceExpense?.category?.name,
                r.invoiceExpense?.supplier?.name,
                r.paymentMethod?.name,
                r.invoiceExpense?.total_amount,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return haystack.includes(term);
        });
    }, [records, search]);

    useEffect(() => {
        if (filtered.length === 0) {
            setSelectedId(null);
            setIsPanelOpen(false);
            return;
        }

        const stillVisible = filtered.some((r) => r.id === selectedId);
        if (!selectedId || !stillVisible) {
            setSelectedId(filtered[0].id);
        }
    }, [filtered, selectedId]);

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

    const selected = useMemo(() => filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? null, [filtered, selectedId]);

    const stats = useMemo(() => {
        let totalUsd = 0;
        let totalVes = 0;

        for (const r of records) {
            const cur = (r.paymentMethod?.currency ?? "USD").toUpperCase();
            const amt = Number(r.amount || 0);
            if (cur === "VES") totalVes += amt;
            else totalUsd += amt;
        }

        const uniqueInvoices = new Set(records.map((r) => r.invoiceExpenseId)).size;

        return {
            totalRecords: records.length,
            totalUsd,
            totalVes,
            uniqueInvoices,
        };
    }, [records]);

    const columns: Column<ExpensePaymentRecord>[] = useMemo(() => [
        {
            header: "PAYMENT",
            accessorKey: "id",
            cell: (r) => (
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-primary-900">#{r.id}</span>
                    <span className="text-xs text-cool-gray-50">{r.invoiceExpense?.category?.name ?? "Sin categoria"}</span>
                    <span className="text-xs text-cool-gray-50">{r.date_at ? format(new Date(r.date_at), "dd MMM yyyy · HH:mm", { locale: es }) : "Sin fecha"}</span>
                </div>
            ),
        },
        {
            header: "SUPPLIER / INFO",
            accessorKey: "invoiceExpenseId",
            cell: (r) => (
                <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-medium text-cool-gray-90 truncate">{r.invoiceExpense?.supplier?.name ?? "Sin proveedor"}</span>
                    <span className="text-xs text-cool-gray-50 truncate">{r.paymentMethod?.name ?? "Método"} · {r.paymentMethod?.currency ?? "USD"}</span>
                </div>
            ),
        },
        {
            header: "AMOUNT",
            accessorKey: "amount",
            cell: (r) => {
                const currency = r.paymentMethod?.currency ?? "USD";

                return (
                    <div className="flex flex-col gap-1">
                        <span className="font-semibold text-cool-gray-90">{money(r.amount, currency === "VES" ? "VES" : currency)}</span>
                        <span className="text-xs text-cool-gray-50">Total invoice: {money(r.invoiceExpense?.total_amount ?? 0, currency === "VES" ? "VES" : currency)}</span>
                    </div>
                );
            },
        },
        {
            header: "ACTIONS",
            accessorKey: "id",
            align: "right",
            cell: (r) => (
                <button
                    type="button"
                    onClick={() => {
                        setSelectedId(r.id);
                        setIsPanelOpen(true);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-primary-200 bg-white px-3 py-2 text-xs font-semibold text-primary-700 hover:border-primary-400 hover:bg-primary-50 transition-colors"
                >
                    View detail
                    <FaArrowRight size={11} />
                </button>
            ),
        },
    ], []);

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                Could not load paid services history.
                <button
                    type="button"
                    onClick={() => mutate()}
                    className="ml-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-white hover:bg-red-700 transition-colors"
                >
                    Retry
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
                        title="Paid services"
                        value={stats.totalRecords}
                        color="primary"
                        icon={<FaReceipt size={18} />}
                        variant="compact"
                    />
                    <StatsCard
                        title="Total USD"
                        value={money(stats.totalUsd, "USD")}
                        color="success"
                        icon={<FaSackDollar size={18} />}
                        variant="compact"
                    />
                    <StatsCard
                        title="Total VES"
                        value={money(stats.totalVes, "VES")}
                        color="primary"
                        icon={<FaFileInvoiceDollar size={18} />}
                        variant="compact"
                    />
                    <StatsCard
                        title="Unique invoices"
                        value={stats.uniqueInvoices}
                        color="warning"
                        icon={<FaClock size={18} />}
                        variant="compact"
                    />
                </div>

                <section className="space-y-4">
                    <div className="rounded-2xl border border-primary-200 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
                        <div className="flex flex-col gap-4 border-b border-primary-200 bg-primary-50/70 px-5 py-4 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-1">
                                <h2 className="text-lg font-semibold text-primary-900">Paid services history</h2>
                                <p className="text-sm text-cool-gray-60">Payments for services and related invoice info.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => mutate()}
                                    className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-white px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 transition-colors"
                                >
                                    <FaRotateRight size={13} />
                                    Refresh
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 border-b border-primary-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                            <label className="relative block w-full lg:max-w-md">
                                <span className="sr-only">Search payments</span>
                                <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cool-gray-40" size={14} />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Buscar por proveedor, método o monto"
                                    className="w-full rounded-xl border border-primary-200 bg-white py-2.5 pl-9 pr-4 text-sm text-cool-gray-90 outline-none transition-colors placeholder:text-cool-gray-40 focus:border-primary-400"
                                />
                            </label>

                            <div className="flex flex-wrap gap-2">
                                {/* place for future filters */}
                            </div>
                        </div>

                        <DataTable<ExpensePaymentRecord>
                            className="rounded-none! border-none!"
                            endpoint=""
                            data={filtered}
                            columns={columns}
                            isLoading={isLoading}
                        />
                    </div>
                </section>
            </div>

            <div className={`fixed inset-0 z-40 transition ${isPanelOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!isPanelOpen}>
                <button
                    type="button"
                    aria-label="Close detail panel"
                    onClick={() => setIsPanelOpen(false)}
                    className={`absolute inset-0 bg-cool-gray-90/50 backdrop-blur-[2px] transition-opacity duration-300 ${isPanelOpen ? "opacity-100" : "opacity-0"}`}
                />

                <aside
                    className={`absolute right-0 top-0 flex h-full w-full max-w-[min(92vw,32rem)] flex-col border-l border-primary-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${isPanelOpen ? "translate-x-0" : "translate-x-full"}`}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="paid-service-detail-title"
                >
                    {selected ? (
                        <>
                            <div className="flex items-start justify-between gap-4 border-b border-primary-200 bg-primary-50 px-5 py-4">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">Payment detail</p>
                                    <h3 id="paid-service-detail-title" className="text-lg font-semibold text-primary-900">Payment #{selected.id}</h3>
                                    <p className="text-sm text-cool-gray-60">Invoice #{selected.invoiceExpense?.id} · {selected.invoiceExpense?.category?.name}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsPanelOpen(false)}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary-200 bg-white text-primary-700 hover:bg-primary-50 transition-colors"
                                    aria-label="Close detail"
                                >
                                    <FaXmark size={14} />
                                </button>
                            </div>

                            <div className="flex-1 space-y-5 overflow-y-auto p-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div className="rounded-xl border border-primary-100 bg-primary-50/70 p-3">
                                        <p className="text-xs uppercase tracking-wide text-cool-gray-50">Supplier</p>
                                        <p className="mt-1 font-semibold text-primary-900">{selected.invoiceExpense?.supplier?.name ?? "Sin proveedor"}</p>
                                        <p className="text-xs text-cool-gray-60">{selected.invoiceExpense?.supplier?.contact ?? "Sin contacto"}</p>
                                    </div>
                                    <div className="rounded-xl border border-primary-100 bg-primary-50/70 p-3">
                                        <p className="text-xs uppercase tracking-wide text-cool-gray-50">Payment method</p>
                                        <p className="mt-1 font-semibold text-primary-900">{selected.paymentMethod?.name ?? "Método"}</p>
                                        <p className="text-xs text-cool-gray-60">Currency: {selected.paymentMethod?.currency ?? "USD"}</p>
                                    </div>
                                    <div className="rounded-xl border border-primary-100 bg-primary-50/70 p-3">
                                        <p className="text-xs uppercase tracking-wide text-cool-gray-50">Date</p>
                                        <p className="mt-1 font-semibold text-primary-900">{selected.date_at ? format(new Date(selected.date_at), "dd MMM yyyy", { locale: es }) : "Sin fecha"}</p>
                                    </div>
                                    <div className="rounded-xl border border-primary-100 bg-primary-50/70 p-3">
                                        <p className="text-xs uppercase tracking-wide text-cool-gray-50">Exchange rate</p>
                                        <p className="mt-1 font-semibold text-primary-900">{selected.exchangeRate?.rate ? money(selected.exchangeRate.rate, "VES") : "Sin tasa"}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <StatsCard
                                        title="Amount"
                                        value={money(selected.amount, selected.paymentMethod?.currency === "VES" ? "VES" : (selected.paymentMethod?.currency ?? "USD"))}
                                        color="success"
                                        icon={<FaSackDollar size={16} />}
                                        variant="compact"
                                    />
                                    <StatsCard
                                        title="Invoice total"
                                        value={money(selected.invoiceExpense?.total_amount ?? 0, selected.paymentMethod?.currency === "VES" ? "VES" : (selected.paymentMethod?.currency ?? "USD"))}
                                        color="primary"
                                        icon={<FaFileInvoiceDollar size={16} />}
                                        variant="compact"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-primary-900">
                                        <FaBoxesStacked size={14} />
                                        Invoice info
                                    </div>
                                    <div className="rounded-xl border border-primary-100 p-3 text-sm">
                                        <p className="font-semibold text-primary-900">Category: {selected.invoiceExpense?.category?.name}</p>
                                        <p className="mt-2 text-xs text-cool-gray-60">Date: {selected.invoiceExpense?.date_at ? format(new Date(selected.invoiceExpense.date_at), "dd MMM yyyy", { locale: es }) : "Sin fecha"}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex h-full items-center justify-center p-6 text-sm text-cool-gray-60">No record selected.</div>
                    )}
                </aside>
            </div>
        </>
    );
};

export default PaidServicesHistoryDashboard;
