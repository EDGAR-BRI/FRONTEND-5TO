import { StatsCard } from '@/components/react/primary/StatsCard';
import { FaBoxOpen, FaFileLines, FaSackDollar, FaUsers } from 'react-icons/fa6';

export const OverviewStats = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
                variant="compact"
                title="Pacientes"
                value={8249}
                color="primary"
                icon={<FaUsers size={22} />}
            />
            <StatsCard
                variant="compact"
                title="Insumos Críticos"
                value={12}
                color="warning"
                icon={<FaBoxOpen size={22} />}
            />
            <StatsCard
                variant="compact"
                title="Ingresos del Mes"
                value="$45.200"
                color="success"
                icon={<FaSackDollar size={22} />}
            />
            <StatsCard
                variant="compact"
                title="Nuevos Reportes"
                value={34}
                color="primary"
                icon={<FaFileLines size={22} />}
            />
        </div>
    );
};
