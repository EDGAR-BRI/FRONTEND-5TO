import React from 'react';
import { StatsCard } from '@/components/react/admin/finance/StatsCard';
import { LuUsers, LuPackage, LuBanknote, LuFileText } from 'react-icons/lu';

export const OverviewStats = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
                variant="compact"
                title="Pacientes"
                value={8249}
                color="primary"
                icon={<LuUsers size={22} />}
            />
            <StatsCard
                variant="compact"
                title="Insumos Críticos"
                value={12}
                color="warning"
                icon={<LuPackage size={22} />}
            />
            <StatsCard
                variant="compact"
                title="Ingresos del Mes"
                value="$45.200"
                color="success"
                icon={<LuBanknote size={22} />}
            />
            <StatsCard
                variant="compact"
                title="Nuevos Reportes"
                value={34}
                color="primary"
                icon={<LuFileText size={22} />}
            />
        </div>
    );
};
