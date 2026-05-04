import { useState, useEffect, useMemo } from 'react';
import { DataTable, type Column } from '@/components/react/primary/DataTable';
import { Badge } from '@/components/react/primary/Badge';
import { Button } from '@/components/react/primary/Button';
import { StatsCard } from '@/components/react/primary/StatsCard';
import { AddTransactionModal } from './AddTransactionModal';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { getExpenseLedger } from '@/lib/services/admin/admin.service';
import {
    FaArrowTrendDown,
    FaDollarSign,
    FaClock,
    FaDownload,
    FaEllipsisVertical,
    FaChevronDown,
    FaSackDollar,
} from 'react-icons/fa6';

interface Transaction {
    id: string;
    source: string;
    occurredAt: string;
    description: string;
    counterparty: string;
    category: string;
    amountUsd: number;
    amountVes: number;
    status: string;
}

export const ExpenseDashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [summary, setSummary] = useState({
        totalUsd: 0,
        totalVes: 0,
        bySource: {
            PURCHASE: { totalUsd: 0 },
            OPEX: { totalUsd: 0 },
            PAYROLL: { totalUsd: 0 },
        }
    });

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                // Fetch last 30 days by default
                const toDate = new Date();
                const fromDate = subDays(toDate, 30);
                
                const data = await getExpenseLedger({ 
                    from: format(fromDate, 'yyyy-MM-dd'), 
                    to: format(toDate, 'yyyy-MM-dd') 
                });
                
                if (mounted) {
                    setSummary(data.totals);
                    setTransactions(data.items);
                }
            } catch (err) {
                console.error('Error fetching expense ledger:', err);
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const avgExpense = useMemo(() => {
        return transactions.length > 0 ? summary.totalUsd / transactions.length : 0;
    }, [transactions, summary.totalUsd]);

    const cancelledCount = useMemo(() => {
        return transactions.filter(t => t.status?.toLowerCase() === 'cancelled' || t.status?.toLowerCase() === 'anulled').length;
    }, [transactions]);

    const columns: Column<Transaction>[] = useMemo(() => [
        {
            header: "PROVEEDOR / CONTRAPARTE",
            accessorKey: "counterparty",
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{item.counterparty || 'N/A'}</span>
                    <span className="text-xs text-gray-500">
                        {item.id} • {item.occurredAt ? format(new Date(item.occurredAt), 'dd MMM yyyy', { locale: es }) : 'Sin fecha'}
                    </span>
                </div>
            )
        },
        {
            header: "DETALLE",
            accessorKey: "description",
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="text-gray-700">{item.description}</span>
                    <span className="text-xs text-gray-400">Origen: {item.source}</span>
                </div>
            )
        },
        {
            header: "CATEGORÍA",
            accessorKey: "category",
            cell: (item) => {
                return (
                    <Badge styles={{
                        bg: 'bg-red-50',
                        text: 'text-red-600',
                        border: 'border-transparent',
                        rounded: 'rounded-md',
                        padding: 'px-2 py-1'
                    }}>
                        <div className="flex items-center gap-1">
                            <span>📉</span>
                            <span>{item.category || item.source}</span>
                        </div>
                    </Badge>
                )
            }
        },
        {
            header: "MONTO (USD)",
            accessorKey: "amountUsd",
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900">
                        ${(item.amountUsd || 0).toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-400">
                        Bs. {(item.amountVes || 0).toFixed(2)}
                    </span>
                </div>
            )
        },
        {
            header: "ESTADO",
            accessorKey: "status",
            cell: (item) => {
                const statusStr = (item.status || 'pending').toLowerCase();
                let config = { bg: 'bg-yellow-100', text: 'text-yellow-700', label: item.status || 'Pendiente' };
                if (statusStr.includes('paid') || statusStr.includes('complet')) {
                    config = { bg: 'bg-green-100', text: 'text-green-700', label: 'Completado' };
                } else if (statusStr.includes('cancel') || statusStr.includes('anul')) {
                    config = { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Cancelado' };
                }
                
                return (
                    <Badge styles={{ bg: config.bg, text: config.text, rounded: 'rounded-full' }}>
                        <div className="flex items-center gap-1">
                            {config.label === 'Completado' && <span>✓</span>}
                            {config.label}
                        </div>
                    </Badge>
                );
            }
        },
        {
            header: "ACCIONES",
            accessorKey: "id",
            align: "right",
            cell: () => (
                <div className="flex items-center justify-end gap-2 text-gray-400">
                    <button className="hover:text-primary transition-colors p-1" title="Descargar">
                        <FaDownload size={16} />
                    </button>
                    <button className="hover:text-primary transition-colors p-1" title="Más opciones">
                        <FaEllipsisVertical size={16} />
                    </button>
                </div>
            )
        }
    ], []);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Gastos Totales (30d)"
                    value={`$${summary.totalUsd.toFixed(2)}`}
                    color="danger"
                    icon={<FaArrowTrendDown size={18} />}
                />
                <StatsCard
                    title="Gasto Promedio"
                    value={`$${avgExpense.toFixed(2)}`}
                    color="warning"
                    icon={<FaSackDollar size={18} />}
                />
                <StatsCard
                    title="Cant. de Egresos"
                    value={transactions.length}
                    color="primary"
                    icon={<FaSackDollar size={18} />}
                />
                <StatsCard
                    title="Cancelados"
                    value={cancelledCount}
                    color="warning"
                    icon={<FaClock size={18} />}
                />
            </div>

            <section className="bg-primary-700 rounded-lg border border-primary-400 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 shrink-0 rounded-lg bg-white/10 flex items-center justify-center">
                            <FaDollarSign size={18} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-semibold text-white leading-tight truncate">
                                Movimientos de Egresos
                            </h2>
                            <p className="text-xs text-primary-200 mt-0.5">
                                Pagos a proveedores y gastos operativos.
                            </p>
                        </div>
                    </div>
                    <Button
                        label="+ Nuevo Egreso"
                        variant="primary"
                        onClick={() => setIsModalOpen(true)}
                        className="shrink-0 bg-white! text-primary-700! hover:bg-primary-50! rounded-lg! text-sm! font-semibold! border-0! shadow-sm!"
                    />
                </div>

                <div className="px-6 py-3 flex flex-wrap gap-3 items-center border-b border-gray-100 bg-white/5">
                    <div className="flex flex-wrap gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-transparent border border-primary-400/50 rounded-lg hover:bg-white/10 transition-colors shadow-xs">
                            Todos los egresos
                            <FaChevronDown size={12} />
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-transparent border border-primary-400/50 rounded-lg hover:bg-white/10 transition-colors shadow-xs">
                            Todos los estados
                            <FaChevronDown size={12} />
                        </button>
                    </div>
                </div>

                <DataTable
                    className="rounded-none! border-none!"
                    endpoint=""
                    data={transactions}
                    columns={columns}
                    isLoading={isLoading}
                />
            </section>

            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialType="expense"
            />
        </div>
    );
};
