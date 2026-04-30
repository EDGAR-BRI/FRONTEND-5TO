import { StatsCard } from '@/components/react/primary/StatsCard';
import PreviewBox from './PreviewBox';
import { FaArrowTrendDown, FaCalendarDays, FaSackDollar, FaUsers } from 'react-icons/fa6';

export default function StatsCardDemo() {
  return (
    <div className="not-content space-y-4">

      <PreviewBox label='variant="default" — layout vertical (usa en grids de stats)' className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-mono text-cool-gray-50 mb-1">color="primary" + trend + trendUp</p>
          <StatsCard title="Total pacientes" value="1,248" trend="8.3%" trendUp color="primary" icon={<FaUsers className="w-5 h-5" />} />
        </div>
        <div>
          <p className="text-[10px] font-mono text-cool-gray-50 mb-1">color="danger" + trend + trendUp=false</p>
          <StatsCard title="Citas del mes" value={342} trend="5.1%" trendUp={false} color="danger" icon={<FaCalendarDays className="w-5 h-5" />} />
        </div>
        <div>
          <p className="text-[10px] font-mono text-cool-gray-50 mb-1">color="success" + subText</p>
          <StatsCard title="Ingresos" value="$12,400" subText="Actualizado hoy" subTextClass="text-green-600" color="success" icon={<FaSackDollar className="w-5 h-5" />} />
        </div>
        <div>
          <p className="text-[10px] font-mono text-cool-gray-50 mb-1">color="warning" + subText</p>
          <StatsCard title="Doctores activos" value={8} subText="2 de guardia" color="warning" icon={<FaUsers className="w-5 h-5" />} />
        </div>
      </PreviewBox>

      <PreviewBox label='variant="compact" — layout horizontal (usa en listas / sidebars)' className="flex-col w-full gap-3">
        <div className="w-full">
          <p className="text-[10px] font-mono text-cool-gray-50 mb-1">variant="compact" + color="primary" + trend</p>
          <StatsCard title="Total pacientes" value="1,248" trend="8.3%" trendUp color="primary" variant="compact" icon={<FaUsers className="w-5 h-5" />} />
        </div>
        <div className="w-full">
          <p className="text-[10px] font-mono text-cool-gray-50 mb-1">variant="compact" + color="warning" + subText</p>
          <StatsCard title="Citas de hoy" value={12} subText="3 pendientes" subTextClass="text-yellow-600" color="warning" variant="compact" icon={<FaCalendarDays className="w-5 h-5" />} />
        </div>
        <div className="w-full">
          <p className="text-[10px] font-mono text-cool-gray-50 mb-1">variant="compact" + color="danger" + trendUp=false</p>
          <StatsCard title="Ingresos del mes" value="$4,200" trend="5.1%" trendUp={false} color="danger" variant="compact" icon={<FaSackDollar className="w-5 h-5" />} />
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
            icon={<FaUsers className="w-5 h-5" />}
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
            icon={<FaCalendarDays className="w-5 h-5" />}
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
            icon={<FaArrowTrendDown className="w-5 h-5" />}
            />
        </div>
    )
}

export function StatsCardGridDemo() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Pacientes" value="1,248" trend="8%" trendUp={true} icon={<FaUsers className="w-5 h-5" />} />
            <StatsCard title="Citas hoy" value={24} subText="6 pendientes" icon={<FaCalendarDays className="w-5 h-5" />} color="warning" />
            <StatsCard title="Ingresos" value="$12,400" trend="3%" trendUp={false} icon={<FaArrowTrendDown className="w-5 h-5" />} color="danger" />
            <StatsCard title="Doctores" value={8} subText="2 de guardia" icon={<FaUsers className="w-5 h-5" />} color="success" />
        </div>
    )
}
