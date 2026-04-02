import { StatsCard } from '@/components/react/primary/StatsCard';

export interface StatItem {
    label: string;
    value: string;
    icon: string;
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
            {stats.map((stat, i) => (
                <StatsCard
                    key={i}
                    title={stat.label}
                    value={stat.value}
                    subText={stat.sub ?? ""}
                    subTextClass={stat.subColor ?? ""}
                    color={stat.color}
                    icon={<i className={`${stat.icon} text-[18px]`} />}
                />
            ))}
        </div>
    );
};