import { StatsCard } from '@/components/react/primary/StatsCard';
import type { IconType } from 'react-icons';
import {
  FaCalendarCheck,
  FaUserPlus,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaIdCard,
  FaUserTie,
  FaRegClock,
  FaCalendarDay,
  FaCalendarPlus,
  FaCreditCard,
  FaClock,
} from 'react-icons/fa6';

export interface StatItem {
    label: string;
    value: string;
    icon: IconType;
    color: "primary" | "success" | "danger" | "warning";
    sub?: string;
    subColor?: string;
}

interface ReceptionistStatsSummaryProps {
    stats: StatItem[];
}

const stats: StatItem[] = [
  {
    label: 'Citas hoy',
    value: '18',
    icon: FaCalendarCheck,
    color: 'primary',
    sub: '3 pendientes de confirmar',
    subColor: 'text-warning',
  },
  {
    label: 'Pacientes registrados',
    value: '5',
    icon: FaUserPlus,
    color: 'success',
    sub: 'Nuevos hoy',
    subColor: 'text-success',
  },
  {
    label: 'Pagos cobrados',
    value: '$1,240',
    icon: FaMoneyBillWave,
    color: 'success',
    sub: '9 transacciones',
    subColor: 'text-cool-gray-50',
  },
  {
    label: 'Facturas pendientes',
    value: '4',
    icon: FaFileInvoiceDollar,
    color: 'danger',
    sub: 'Requieren gestión',
    subColor: 'text-error',
  },
];

export const ReceptionistStatsSummary = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
                const Icon = stat.icon;

                return (
                    <StatsCard
                        key={i}
                        title={stat.label}
                        value={stat.value}
                        subText={stat.sub ?? ""}
                        subTextClass={stat.subColor ?? ""}
                        color={stat.color}
                        icon={<Icon className="text-[18px]" />}
                    />
                );
            })}
        </div>
    );
};