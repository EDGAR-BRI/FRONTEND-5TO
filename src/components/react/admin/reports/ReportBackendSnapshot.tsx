import { useEffect, useState } from "react";
import { StatsCard } from "@/components/react/primary/StatsCard";
import { FaChartLine, FaClipboardList, FaSackDollar } from "react-icons/fa6";
import { getReportSnapshot, type ReportSnapshotScope } from "@/lib/services/admin/admin.service";

export default function ReportBackendSnapshot({ scope }: { scope: ReportSnapshotScope }) {
	const [data, setData] = useState({
		total: 0,
		secondary: 0,
		tertiary: 0,
		labelTotal: "Total",
		labelSecondary: "Métrica 2",
		labelTertiary: "Métrica 3",
	});

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const result = await getReportSnapshot(scope);
				if (mounted) setData(result);
			} catch {
				if (mounted) {
					setData((prev) => ({ ...prev }));
				}
			}
		})();

		return () => {
			mounted = false;
		};
	}, [scope]);

	return (
		<section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
			<StatsCard title={data.labelTotal} value={scope === "operativos" ? data.total : `$${data.total.toFixed(2)}`} color="primary" icon={<FaSackDollar size={18} />} variant="compact" />
			<StatsCard title={data.labelSecondary} value={data.secondary} color="success" icon={<FaClipboardList size={18} />} variant="compact" />
			<StatsCard title={data.labelTertiary} value={scope === "resultados" ? `$${data.tertiary.toFixed(2)}` : data.tertiary} color="warning" icon={<FaChartLine size={18} />} variant="compact" />
		</section>
	);
}
