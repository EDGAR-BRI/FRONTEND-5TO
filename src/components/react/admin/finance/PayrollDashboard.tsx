import { useState, useMemo } from 'react';
import { DataTable, type Column } from '@/components/react/primary/DataTable';
import { Badge } from '@/components/react/primary/Badge';
import { Button } from '@/components/react/primary/Button';
import { StatsCard } from '@/components/react/primary/StatsCard';
import { AddPayrollModal } from './AddPayrollModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    FaMoneyCheckDollar,
    FaUsers,
    FaClock,
    FaDownload,
    FaEllipsisVertical,
    FaChevronDown,
} from 'react-icons/fa6';

interface PayrollTransaction {
    id: number;
    employeeName: string;
    role: string;
    code: string;
    date: string;
    detail: string;
    amount: number;
    status: 'completed' | 'pending';
}

const mockTransactions: PayrollTransaction[] = [
    {
        id: 1,
        employeeName: 'Dr. Roberto Mendoza',
        role: 'Médico Especialista',
        code: 'NOM-1001',
        date: new Date().toISOString(),
        detail: 'Quincena 1 - Mayo 2026',
        amount: 1500.00,
        status: 'completed'
    },
    {
        id: 2,
        employeeName: 'Dra. Ana López',
        role: 'Médico General',
        code: 'NOM-1002',
        date: new Date().toISOString(),
        detail: 'Quincena 1 - Mayo 2026',
        amount: 1200.00,
        status: 'completed'
    },
    {
        id: 3,
        employeeName: 'Carlos Ruiz',
        role: 'Recepción',
        code: 'NOM-1003',
        date: new Date().toISOString(),
        detail: 'Quincena 1 - Mayo 2026',
        amount: 450.00,
        status: 'completed'
    },
    {
        id: 4,
        employeeName: 'María Gómez',
        role: 'Enfermería',
        code: 'NOM-1004',
        date: new Date().toISOString(),
        detail: 'Quincena 1 - Mayo 2026',
        amount: 600.00,
        status: 'pending'
    }
];

export const PayrollDashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Para la maquetación usamos datos estáticos sin loading real
    const transactions = mockTransactions;
    const isLoading = false;

    const totalPaid = useMemo(() => {
        return transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
    }, [transactions]);

    const pendingAmount = useMemo(() => {
        return transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);
    }, [transactions]);

    const employeesPaidCount = useMemo(() => {
        return new Set(transactions.filter(t => t.status === 'completed').map(t => t.employeeName)).size;
    }, [transactions]);

    const columns: Column<PayrollTransaction>[] = useMemo(() => [
        {
            header: "EMPLEADO",
            accessorKey: "employeeName",
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{item.employeeName}</span>
                    <span className="text-xs text-gray-500">
                        {item.role}
                    </span>
                </div>
            )
        },
        {
            header: "REFERENCIA / DETALLE",
            accessorKey: "detail",
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="text-gray-700">{item.detail}</span>
                    <span className="text-xs text-gray-400">
                        {item.code} • {item.date ? format(new Date(item.date), 'dd MMM yyyy', { locale: es }) : 'Sin fecha'}
                    </span>
                </div>
            )
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
                    completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Pagado' },
                    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendiente' },
                };
                const config = statusConfig[item.status];
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
                    <button className="hover:text-primary transition-colors p-1" title="Descargar Comprobante">
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
                    title="Total Pagado (Mes)"
                    value={`$${totalPaid.toFixed(2)}`}
                    color="primary"
                    icon={<FaMoneyCheckDollar size={18} />}
                />
                <StatsCard
                    title="Nóminas por Pagar"
                    value={`$${pendingAmount.toFixed(2)}`}
                    color="warning"
                    icon={<FaClock size={18} />}
                />
                <StatsCard
                    title="Empleados Pagados"
                    value={employeesPaidCount}
                    color="success"
                    icon={<FaUsers size={18} />}
                />
                <StatsCard
                    title="Total de Registros"
                    value={transactions.length}
                    color="primary"
                    icon={<FaMoneyCheckDollar size={18} />}
                />
            </div>

            <section className="bg-primary-700 rounded-lg border border-primary-400 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 shrink-0 rounded-lg bg-white/10 flex items-center justify-center">
                            <FaMoneyCheckDollar size={18} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-semibold text-white leading-tight truncate">
                                Historial de Nóminas
                            </h2>
                            <p className="text-xs text-primary-200 mt-0.5">
                                Pagos realizados a personal médico y administrativo.
                            </p>
                        </div>
                    </div>
                    <Button
                        label="+ Pagar Nómina"
                        variant="primary"
                        onClick={() => setIsModalOpen(true)}
                        className="shrink-0 bg-white! text-primary-700! hover:bg-primary-50! rounded-lg! text-sm! font-semibold! border-0! shadow-sm!"
                    />
                </div>

                <div className="px-6 py-3 flex flex-wrap gap-3 items-center border-b border-gray-100 bg-white/5">
                    <div className="flex flex-wrap gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-transparent border border-primary-400/50 rounded-lg hover:bg-white/10 transition-colors shadow-xs">
                            Este Mes
                            <FaChevronDown size={12} />
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-transparent border border-primary-400/50 rounded-lg hover:bg-white/10 transition-colors shadow-xs">
                            Todos los roles
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

            <AddPayrollModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};
