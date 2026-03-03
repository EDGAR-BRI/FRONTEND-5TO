import React, { useState, useEffect } from 'react';
import { DataTable, type Column } from '@/components/react/primary/DataTable';
import { Badge } from '@/components/react/primary/Badge';
import { Button } from '@/components/react/primary/Button';
import { StatsCard } from './StatsCard';
import { AddTransactionModal } from './AddTransactionModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    LuTrendingUp, LuTrendingDown, LuDollarSign, LuClock,
    LuDownload, LuEllipsisVertical, LuChevronDown, LuCircleDollarSign
} from 'react-icons/lu';

interface Transaction {
    id: number;
    patientName: string;
    code: string;
    date: string;
    detail: string;
    provider: string;
    category: 'Consulta' | 'Farmacia';
    amount: number;
    status: 'completed' | 'pending' | 'cancelled';
}

const columns: Column<Transaction>[] = [
    {
        header: "PACIENTE / CLIENTE",
        accessorKey: "patientName",
        cell: (item) => (
            <div className="flex flex-col">
                <span className="font-semibold text-gray-900">{item.patientName}</span>
                <span className="text-xs text-gray-500">
                    {item.code} • {format(new Date(item.date), 'dd MMM yyyy', { locale: es })}
                </span>
            </div>
        )
    },
    {
        header: "DETALLE (SERVICIO/MEDICINA)",
        accessorKey: "detail",
        cell: (item) => (
            <div className="flex flex-col">
                <span className="text-gray-700">{item.detail}</span>
                <span className="text-xs text-gray-400">Atiende: {item.provider}</span>
            </div>
        )
    },
    {
        header: "CATEGORÍA",
        accessorKey: "category",
        cell: (item) => {
            // Using literal colors or similar logic to match the screenshot
            const typeConfig = item.category === 'Consulta'
                ? { bg: 'bg-blue-50', text: 'text-blue-600', icon: '🩺' }
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
                        <span>{typeConfig.icon}</span>  {/* Placeholder icon */}
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
        accessorKey: "id", // Dummy key
        align: "right",
        cell: (item) => (
            <div className="flex items-center justify-end gap-2 text-gray-400">
                <button className="hover:text-primary transition-colors p-1" title="Descargar">
                    <LuDownload size={16} />
                </button>
                <button className="hover:text-primary transition-colors p-1" title="Más opciones">
                    <LuEllipsisVertical size={16} />
                </button>
            </div>
        )
    }
];

export const FinanceDashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        pendingPayments: 0
    });

    useEffect(() => {
        // Fetch summary data
        fetch('/api/v1/admin/financial-summary')
            .then(res => res.json())
            .then(data => setSummary(data))
            .catch(err => console.error("Error fetching summary:", err));
    }, []);

    return (
        <div className="space-y-6">
            {/* Header Actions */}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Ingresos Totales"
                    value={`$${summary.totalIncome.toFixed(2)}`}
                    trend="12%"
                    trendUp={true}
                    color="success"
                    icon={<LuTrendingUp size={18} />}
                    variant="compact"
                />
                <StatsCard
                    title="Gastos Totales"
                    value={`$${summary.totalExpenses.toFixed(2)}`}
                    trend="5%"
                    trendUp={false}
                    color="danger"
                    icon={<LuTrendingDown size={18} />}
                />
                <StatsCard
                    title="Balance Neto"
                    value={`$${summary.netBalance.toFixed(2)}`}
                    color="primary"
                    icon={<LuCircleDollarSign size={18} />}
                />
                <StatsCard
                    title="Pagos Pendientes"
                    value={summary.pendingPayments}
                    color="warning"
                    icon={<LuClock size={18} />}
                />
            </div>

            {/* Transactions Section */}
            <section className="bg-primary-700 rounded-lg border border-primary-400 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                            <LuDollarSign size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-white leading-tight">Movimientos de Caja</h2>
                            <p className="text-xs text-primary-200 mt-0.5">Ventas de farmacia y pagos de consultas médicas.</p>
                        </div>
                    </div>
                    <Button
                        label="+ Nueva Factura"
                        variant="primary"
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white! text-primary-700! hover:bg-primary-50! rounded-lg! text-sm! font-semibold! border-0! shadow-sm!"
                    />
                </div>

                {/* Filters Bar */}
                <div className="px-6 py-3 flex flex-wrap gap-3 items-center border-b border-gray-100">
                    <div className="flex gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-xs">
                            Todos los ingresos
                            <LuChevronDown size={12} />
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-xs">
                            Todos los estados
                            <LuChevronDown size={12} />
                        </button>
                    </div>
                </div>

                <DataTable
                    className="rounded-none! border-none!"
                    endpoint="/admin/transactions"
                    columns={columns}
                    businessId={1}
                />
            </section>

            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};
