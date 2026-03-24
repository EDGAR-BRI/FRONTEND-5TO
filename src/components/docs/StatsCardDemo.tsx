import React from 'react';
import { StatsCard } from '@/components/react/primary/StatsCard';
import PreviewBox from './PreviewBox';

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const MoneyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrendingDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  );

export default function StatsCardDemo() {
  return (
    <div className="not-content space-y-4">

      <PreviewBox label='variant="default" — layout vertical (usa en grids de stats)' className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-mono text-cool-gray-50 mb-1">color="primary" + trend + trendUp</p>
          <StatsCard title="Total pacientes" value="1,248" trend="8.3%" trendUp color="primary" icon={<UsersIcon />} />
        </div>
        <div>
          <p className="text-[10px] font-mono text-cool-gray-50 mb-1">color="danger" + trend + trendUp=false</p>
          <StatsCard title="Citas del mes" value={342} trend="5.1%" trendUp={false} color="danger" icon={<CalendarIcon />} />
        </div>
        <div>
          <p className="text-[10px] font-mono text-cool-gray-50 mb-1">color="success" + subText</p>
          <StatsCard title="Ingresos" value="$12,400" subText="Actualizado hoy" subTextClass="text-green-600" color="success" icon={<MoneyIcon />} />
        </div>
        <div>
          <p className="text-[10px] font-mono text-cool-gray-50 mb-1">color="warning" + subText</p>
          <StatsCard title="Doctores activos" value={8} subText="2 de guardia" color="warning" icon={<UsersIcon />} />
        </div>
      </PreviewBox>

      <PreviewBox label='variant="compact" — layout horizontal (usa en listas / sidebars)' className="flex-col w-full gap-3">
        <div className="w-full">
          <p className="text-[10px] font-mono text-cool-gray-50 mb-1">variant="compact" + color="primary" + trend</p>
          <StatsCard title="Total pacientes" value="1,248" trend="8.3%" trendUp color="primary" variant="compact" icon={<UsersIcon />} />
        </div>
        <div className="w-full">
          <p className="text-[10px] font-mono text-cool-gray-50 mb-1">variant="compact" + color="warning" + subText</p>
          <StatsCard title="Citas de hoy" value={12} subText="3 pendientes" subTextClass="text-yellow-600" color="warning" variant="compact" icon={<CalendarIcon />} />
        </div>
        <div className="w-full">
          <p className="text-[10px] font-mono text-cool-gray-50 mb-1">variant="compact" + color="danger" + trendUp=false</p>
          <StatsCard title="Ingresos del mes" value="$4,200" trend="5.1%" trendUp={false} color="danger" variant="compact" icon={<MoneyIcon />} />
        </div>
      </PreviewBox>

    </div>
  );
}

export function StatsCardDefaultDemo() {
    return (
        <div className="w-full max-w-sm">
            <StatsCard
            title="Total de pacientes"
            value="1,248"
            trend="8.3%"
            trendUp={true}
            trendLabel="vs mes anterior"
            color="primary"
            icon={<UsersIcon className="w-5 h-5" />}
            />
        </div>
    )
}

export function StatsCardCompactDemo() {
    return (
        <div className="w-full max-w-sm">
            <StatsCard
            title="Citas de hoy"
            value={12}
            subText="3 pendientes"
            subTextClass="text-yellow-600"
            color="warning"
            variant="compact"
            icon={<CalendarIcon className="w-5 h-5" />}
            />
        </div>
    )
}

export function StatsCardNegativeDemo() {
    return (
        <div className="w-full max-w-sm">
            <StatsCard
            title="Ingresos del mes"
            value="$4,200"
            trend="5.1%"
            trendUp={false}
            color="danger"
            icon={<TrendingDownIcon className="w-5 h-5" />}
            />
        </div>
    )
}

export function StatsCardGridDemo() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Pacientes" value="1,248" trend="8%" trendUp={true} icon={<UsersIcon className="w-5 h-5" />} />
            <StatsCard title="Citas hoy" value={24} subText="6 pendientes" icon={<CalendarIcon className="w-5 h-5" />} color="warning" />
            <StatsCard title="Ingresos" value="$12,400" trend="3%" trendUp={false} icon={<TrendingDownIcon className="w-5 h-5" />} color="danger" />
            <StatsCard title="Doctores" value={8} subText="2 de guardia" icon={<UsersIcon className="w-5 h-5" />} color="success" />
        </div>
    )
}
