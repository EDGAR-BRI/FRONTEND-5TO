import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/react/primary/StatsCard';
import { FaBoxOpen, FaFileLines, FaSackDollar, FaUsers } from 'react-icons/fa6';
import { getAdminOverviewStats } from '@/lib/services/admin/admin.service';

export const OverviewStats = () => {
    const [stats, setStats] = useState({
        patients: 0,
        criticalSupplies: 0,
        monthIncome: 0,
        reportsCount: 0,
    });

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const data = await getAdminOverviewStats();
                if (mounted) {
                    setStats(data);
                }
            } catch {
                // Keep defaults if backend fails.
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
                variant="compact"
                title="Pacientes"
                value={stats.patients}
                color="primary"
                icon={<FaUsers size={22} />}
            />
            <StatsCard
                variant="compact"
                title="Insumos Críticos"
                value={stats.criticalSupplies}
                color="warning"
                icon={<FaBoxOpen size={22} />}
            />
            <StatsCard
                variant="compact"
                title="Ingresos del Mes"
                value={`$${stats.monthIncome.toFixed(2)}`}
                color="success"
                icon={<FaSackDollar size={22} />}
            />
            <StatsCard
                variant="compact"
                title="Nuevos Reportes"
                value={stats.reportsCount}
                color="primary"
                icon={<FaFileLines size={22} />}
            />
        </div>
    );
};
