import { useEffect, useMemo, useState } from 'react';
import { getSpecialtyDemand } from '@/lib/services/report/specialtyDemand.service';

type SpecialtyDemandChartProps = {
	from?: string;
	to?: string;
	title?: string;
};


export default function SpecialtyDemandChart({ from, to, title = 'Demanda por Especialidad' }: SpecialtyDemandChartProps) {
	const [items, setItems] = useState<Array<{ specialty: string; percentage: number }>>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
		setLoading(true);

		getSpecialtyDemand({ from, to })
			.then((response) => {
				if (mounted) {
					setItems(response.data.items.map((item) => ({ specialty: item.specialty, percentage: item.percentage })));
				}
			})
			.catch(() => {
				if (mounted) setItems([]);
			})
			.finally(() => {
				if (mounted) setLoading(false);
			});

		return () => {
			mounted = false;
		};
	}, [from, to]);

	const hasItems = useMemo(() => items.length > 0, [items]);

	return (
		<div className="bg-white rounded-xl border border-primary-200 p-6 shadow-sm flex flex-col">
			<h2 className="text-lg font-bold text-gray-800 mb-6">{title}</h2>
			<div className="space-y-6 flex-1 justify-center flex flex-col">
				{loading ? (
					<div className="text-sm text-gray-500">Cargando...</div>
				) : hasItems ? (
					items.map((item) => (
						<div key={item.specialty}>
							<div className="flex justify-between items-center mb-1">
								<span className="text-xs font-bold text-gray-600 uppercase">{item.specialty}</span>
								<span className="text-sm font-black text-gray-900">{item.percentage.toFixed(1)}%</span>
							</div>
							<div className="w-full bg-gray-100 rounded-full h-2.5">
								<div className="h-2.5 rounded-full bg-primary-500 transition-all duration-700" style={{ width: `${item.percentage}%` }} />
							</div>
						</div>
					))
				) : (
					<div className="text-sm text-gray-500">Sin datos para el rango seleccionado.</div>
				)}
			</div>
		</div>
	);
}
