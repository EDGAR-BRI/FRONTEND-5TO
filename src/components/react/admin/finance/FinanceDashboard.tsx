import { useState, useEffect, useMemo } from 'react';
import { DataTable, type Column } from '@/components/react/primary/DataTable';
import { Badge } from '@/components/react/primary/Badge';
import { Button } from '@/components/react/primary/Button';
import { StatsCard } from '@/components/react/primary/StatsCard';
import { AddTransactionModal } from './AddTransactionModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getFinanceDashboardData, type FinanceTransaction } from '@/lib/services/admin/admin.service';
import {
    FaArrowTrendUp,
    FaArrowTrendDown,
    FaDollarSign,
    FaClock,
    FaDownload,
    FaEllipsisVertical,
    FaChevronDown,
    FaSackDollar,
} from 'react-icons/fa6';

interface Transaction {
    id: number;
    patientName: string;
    code: string;
    date: string;
    detail: string;
    provider: string;
    category: string;
    amount: number;
    status: 'completed' | 'pending' | 'cancelled';
}

export type FinanceDashboardType = 'all' | 'income' | 'expense';

export const FinanceDashboard = ({ type = 'all' }: { type?: FinanceDashboardType }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        pendingPayments: 0
    });

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await getFinanceDashboardData();
                if (mounted) {
                    setSummary(data.summary);
                    setTransactions(data.transactions);
                }
            } catch (err) {
                console.error('Error fetching summary:', err);
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            if (type === 'income') return t.category !== 'Gasto';
            if (type === 'expense') return t.category === 'Gasto';
            return true;
        });
    }, [transactions, type]);

    const displaySummary = useMemo(() => {
        if (type === 'income') {
            const completedIncome = filteredTransactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
            return {
                mainCard: { title: "Ingresos Totales", value: summary.totalIncome },
                secondCard: { title: "Ingresos Pagados", value: completedIncome },
                thirdCard: { title: "Facturas", value: filteredTransactions.length, isCurrency: false },
                fourthCard: { title: "Pagos Pendientes", value: summary.pendingPayments, isCurrency: false }
            };
        }
        if (type === 'expense') {
            const avgExpense = filteredTransactions.length > 0 ? summary.totalExpenses / filteredTransactions.length : 0;
            return {
                mainCard: { title: "Gastos Totales", value: summary.totalExpenses },
                secondCard: { title: "Gasto Promedio", value: avgExpense },
                thirdCard: { title: "Cant. de Gastos", value: filteredTransactions.length, isCurrency: false },
                fourthCard: { title: "Cancelados", value: filteredTransactions.filter(t => t.status === 'cancelled').length, isCurrency: false }
            };
        }
        return {
            mainCard: { title: "Ingresos Totales", value: summary.totalIncome },
            secondCard: { title: "Gastos Totales", value: summary.totalExpenses },
            thirdCard: { title: "Balance Neto", value: summary.netBalance },
            fourthCard: { title: "Pagos Pendientes", value: summary.pendingPayments, isCurrency: false }
        };
    }, [summary, filteredTransactions, type]);

    const columns: Column<Transaction>[] = useMemo(() => [
        {
            header: type === 'expense' ? "PROVEEDOR" : type === 'income' ? "PACIENTE / CLIENTE" : "PACIENTE / PROVEEDOR",
            accessorKey: "patientName",
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{item.patientName}</span>
                    <span className="text-xs text-gray-500">
                        {item.code} • {item.date ? format(new Date(item.date), 'dd MMM yyyy', { locale: es }) : 'Sin fecha'}
                    </span>
                </div>
            )
        },
        {
            header: type === 'expense' ? "DETALLE (GASTO/COMPRA)" : type === 'income' ? "DETALLE (SERVICIO/MEDICINA)" : "DETALLE",
            accessorKey: "detail",
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="text-gray-700">{item.detail}</span>
                    <span className="text-xs text-gray-400">{item.category === 'Gasto' ? 'Proveedor: ' : 'Atiende: '} {item.provider}</span>
                </div>
            )
        },
        {
            header: "CATEGORÍA",
            accessorKey: "category",
            cell: (item) => {
                const typeConfig = item.category === 'Consulta'
                    ? { bg: 'bg-blue-50', text: 'text-blue-600', icon: '🩺' }
                    : item.category === 'Gasto'
                        ? { bg: 'bg-red-50', text: 'text-red-600', icon: '📉' }
                        : { bg: 'bg-purple-50', text: 'text-purple-600', icon: '💊' };

                return (
                    <Badge styles={{
                        bg: typeConfig.bg,
                        text: typeConfig.text,
                        border: 'border-transparent',
                        rounded: 'rounded-md',
                        padding: 'px-2 py-1'
                    }}>
                        <div className="flex items-center gap-1">
                            <span>{typeConfig.icon}</span>
                            <span>{item.category}</span>
                        </div>
                    </Badge>
                )
            }
        },
        {
            header: "MONTO",
            accessorKey: "amount",
            cell: (item) => (
                <span className="font-bold text-gray-900">
                    ${item.amount.toFixed(2)}
                </span>
            )
        },
        {
            header: "ESTADO",
            accessorKey: "status",
            cell: (item) => {
                const statusConfig = {
                    completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completado' },
                    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendiente' },
                    cancelled: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Cancelado' }
                };
                const config = statusConfig[item.status] || statusConfig.pending;
                return (
                    <Badge styles={{ bg: config.bg, text: config.text, rounded: 'rounded-full' }}>
                        <div className="flex items-center gap-1">
                            {item.status === 'completed' && <span>✓</span>}
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
    ], [type]);

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title={displaySummary.mainCard.title}
                    value={`$${displaySummary.mainCard.value.toFixed(2)}`}
                    color={type === 'expense' ? 'danger' : 'success'}
                    icon={type === 'expense' ? <FaArrowTrendDown size={18} /> : <FaArrowTrendUp size={18} />}
                />
                <StatsCard
                    title={displaySummary.secondCard.title}
                    value={`$${displaySummary.secondCard.value.toFixed(2)}`}
                    color={type === 'expense' ? 'warning' : type === 'income' ? 'primary' : 'danger'}
                    icon={type === 'expense' ? <FaSackDollar size={18} /> : <FaArrowTrendDown size={18} />}
                />
                <StatsCard
                    title={displaySummary.thirdCard.title}
                    value={displaySummary.thirdCard.isCurrency === false ? displaySummary.thirdCard.value : `$${displaySummary.thirdCard.value.toFixed(2)}`}
                    color="primary"
                    icon={type === 'income' ? <FaDollarSign size={18} /> : <FaSackDollar size={18} />}
                />
                <StatsCard
                    title={displaySummary.fourthCard.title}
                    value={displaySummary.fourthCard.value}
                    color="warning"
                    icon={<FaClock size={18} />}
                />
            </div>

            {/* Transactions Section */}
            <section className="bg-primary-700 rounded-lg border border-primary-400 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 shrink-0 rounded-lg bg-white/10 flex items-center justify-center">
                            <FaDollarSign size={18} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-semibold text-white leading-tight truncate">
                                {type === 'income' ? 'Movimientos de Ingresos' : type === 'expense' ? 'Movimientos de Egresos' : 'Movimientos de Caja'}
                            </h2>
                            <p className="text-xs text-primary-200 mt-0.5">
                                {type === 'income' ? 'Facturación a pacientes y pagos recibidos.' : type === 'expense' ? 'Pagos a proveedores y gastos operativos.' : 'Ventas de farmacia, pagos de consultas médicas y gastos.'}
                            </p>
                        </div>
                    </div>
                    <Button
                        label={type === 'income' ? '+ Nuevo Ingreso' : type === 'expense' ? '+ Nuevo Egreso' : '+ Nueva Transacción'}
                        variant="primary"
                        onClick={() => setIsModalOpen(true)}
                        className="shrink-0 bg-white! text-primary-700! hover:bg-primary-50! rounded-lg! text-sm! font-semibold! border-0! shadow-sm!"
                    />
                </div>

                <div className="px-6 py-3 flex flex-wrap gap-3 items-center border-b border-gray-100 bg-white/5">
                    <div className="flex flex-wrap gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-transparent border border-primary-400/50 rounded-lg hover:bg-white/10 transition-colors shadow-xs">
                            {type === 'income' ? 'Todos los ingresos' : type === 'expense' ? 'Todos los egresos' : 'Todos los movimientos'}
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
                    data={filteredTransactions as Transaction[]}
                    columns={columns}
                    isLoading={isLoading}
                />
            </section>

            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialType={type === 'all' ? 'expense' : type}
            />
        </div>
    );
};
