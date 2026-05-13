import { StatsCard } from '@/components/react/primary/StatsCard';
import {
  FaCalendarCheck,
  FaUserPlus,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
} from 'react-icons/fa6';

export interface StatItem {
    label: string;
    value: string;
    iconKey: 'calendar-check' | 'user-plus' | 'money-bill' | 'file-invoice';
    color: "primary" | "success" | "danger" | "warning";
    sub?: string;
    subColor?: string;
}

interface ReceptionistStatsSummaryProps {
    stats: StatItem[];
}

export const ReceptionistStatsSummary = ({ stats }: ReceptionistStatsSummaryProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
                const Icon = {
                  'calendar-check': FaCalendarCheck,
                  'user-plus': FaUserPlus,
                  'money-bill': FaMoneyBillWave,
                  'file-invoice': FaFileInvoiceDollar,
                }[stat.iconKey];

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
