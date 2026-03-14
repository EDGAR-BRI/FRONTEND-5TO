import React from 'react';
import { StatsCard } from '@/components/react/primary/StatsCard';
import { LuTrendingUp, LuTrendingDown, LuCircleDollarSign, LuClock } from 'react-icons/lu';

interface SummaryData {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    pendingPayments: number;
}

export const DoctorFinanceSummary = ({ summary }: { summary: SummaryData }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatsCard
                title="Ingresos Totales"
                value={`$${summary.totalIncome.toFixed(2)}`}
                trend="12%"
                trendUp={true}
                color="success"
                icon={<LuTrendingUp size={18} />}
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
                value={summary.pendingPayments.toString()}
                color="warning"
                icon={<LuClock size={18} />}
            />
        </div>
    );
};
