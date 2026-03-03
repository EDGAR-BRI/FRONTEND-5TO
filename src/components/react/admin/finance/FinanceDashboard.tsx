import React, { useState, useEffect } from 'react';
import { DataTable, type Column } from '@/components/react/primary/DataTable';
import { Badge } from '@/components/react/primary/Badge';
import { Button } from '@/components/react/primary/Button';
import { StatsCard } from './StatsCard';
import { AddTransactionModal } from './AddTransactionModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                </button>
                <button className="hover:text-primary transition-colors p-1" title="Más opciones">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
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
                />
                <StatsCard 
                    title="Gastos Totales" 
                    value={`$${summary.totalExpenses.toFixed(2)}`} 
                    trend="5%" 
                    trendUp={false} 
                    color="danger"
                />
                <StatsCard 
                    title="Balance Neto" 
                    value={`$${summary.netBalance.toFixed(2)}`} 
                    color="primary"
                />
                <StatsCard 
                    title="Pagos Pendientes" 
                    value={summary.pendingPayments} 
                    color="warning"
                />
            </div>

            {/* Transactions Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <h2 className="text-lg font-semibold text-cool-gray-90">Movimientos de Caja</h2>
                        <p className="text-sm text-cool-gray-50 mt-1">Ventas de farmacia y pagos de consultas médicas.</p>
                    </div>
                </div>
                
                {/* Filters & Actions Bar */}
                <div className="px-6 py-4 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-2">
                        <Button variant="secondary" label="Todos los ingresos Y" className="!rounded-md !text-gray-600 !border-gray-200 !font-normal" />
                        <Button variant="secondary" label="Todos los estados Y" className="!rounded-md !text-gray-600 !border-gray-200 !font-normal" />
                    </div>
                    <Button 
                        label="+ Nueva Factura" 
                        variant="primary" 
                        onClick={() => setIsModalOpen(true)}
                        className="!bg-teal-600 hover:!bg-teal-700 !rounded-md"
                    />
                </div>

                <DataTable 
                    endpoint="/admin/transactions" 
                    columns={columns} 
                    businessId={1} 
                />
            </div>

            <AddTransactionModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
};
