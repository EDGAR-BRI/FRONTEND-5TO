import { useEffect, useMemo, useState } from 'react';
import { getMonthlyRevenue, type MonthlyRevenueQuery } from '@/lib/services/report/monthlyRevenue.service';

type RevenueTimelineChartProps = MonthlyRevenueQuery & {
	title?: string;
	subtitle?: string;
};

const fallback = { label: '', incomeUsd: 0, consultations: 0, periodStart: '', periodEnd: '' };

export default function RevenueTimelineChart({ from, to, period = 'month', title = 'Evolución de Ingresos', subtitle = 'Ingresos del rango filtrado.', }: RevenueTimelineChartProps) {
	const [bars, setBars] = useState<Array<{ label: string; periodStart: string; periodEnd: string; incomeUsd: number; consultations: number }>>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
		setLoading(true);

		getMonthlyRevenue({ from, to, period })
			.then((response) => {
				if (mounted) setBars(response.data.bars);
			})
			.catch(() => {
				if (mounted) setBars([]);
			})
			.finally(() => {
				if (mounted) setLoading(false);
			});

		return () => {
			mounted = false;
		};
	}, [from, to, period]);

	const maxValue = useMemo(() => Math.max(...bars.map((item) => item.incomeUsd), 1), [bars]);

	return (
		<div className="bg-white rounded-xl border border-primary-200 p-6 shadow-sm">
			<div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
				<div>
					<h2 className="text-lg font-bold text-gray-800">{title}</h2>
					<p className="text-sm text-gray-500">{subtitle}</p>
				</div>
				<span className="text-xs font-bold uppercase text-gray-500">{period}</span>
			</div>
			<div className="h-64 flex items-end justify-between gap-3 pt-4 border-b border-gray-100 pb-2">
				{loading ? (
					<div className="text-sm text-gray-500">Cargando...</div>
				) : bars.length > 0 ? (
					bars.map((bar) => (
						<div className="relative flex flex-col items-center flex-1 group h-full justify-end" key={`${bar.periodStart}-${bar.periodEnd}`}>
							<div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10 shadow-lg font-bold">
								${bar.incomeUsd.toLocaleString()}
							</div>
							<div className="w-full bg-primary-500 hover:bg-primary-600 transition-all rounded-t-md shadow-sm" style={{ height: `${(bar.incomeUsd / maxValue) * 100}%` }} />
							<span className="text-[10px] text-gray-500 mt-2 font-bold uppercase text-center">{bar.label}</span>
						</div>
					))
				) : (
					<div className="text-sm text-gray-500">Sin datos para el rango seleccionado.</div>
				)}
			</div>
		</div>
	);
}
