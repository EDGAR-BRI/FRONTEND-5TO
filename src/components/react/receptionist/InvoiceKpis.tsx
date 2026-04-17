import { StatsCard } from '@/components/react/primary/StatsCard';
import { FaFileLines, FaUserCheck, FaClock, FaBan } from 'react-icons/fa6';

type InvoiceKpisProps = {
    pendientes: number;
    emitidasHoy: number;
    anuladas: number;
    totalEmitidoHoy: number;
};

export function InvoiceKpis({
    pendientes,
    emitidasHoy,
    anuladas,
    totalEmitidoHoy,
}: InvoiceKpisProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <StatsCard
                title="Pendientes"
                value={pendientes}
                color="warning"
                variant="compact"
                icon={<FaClock size={20} />}
            />

            <StatsCard
                title="Emitidas Hoy"
                value={emitidasHoy}
                color="success"
                variant="compact"
                icon={<FaUserCheck size={20} />}
            />

            <StatsCard
                title="Total Emitido (Hoy)"
                value={`$${totalEmitidoHoy.toFixed(2)}`}
                color="primary"
                variant="compact"
                icon={<FaFileLines size={20} />}
            />

            <StatsCard
                title="Anuladas"
                value={anuladas}
                color="danger"
                variant="compact"
                icon={<FaBan size={20} />}
            />
        </div>
    );
}
