import PdfExportButton from "@/components/pdf/PdfExportButton";

interface Props {
	from?: string;
	to?: string;
	period?: string;
	preset?: string;
}

export default function IngresosPdfExport({ from, to, period, preset }: Props) {
	const params = new URLSearchParams();
	if (from) params.set("from", from);
	if (to) params.set("to", to);
	if (period) params.set("period", period);
	if (preset) params.set("preset", preset);
	const endpoint = `/report/income-summary/pdf${params.toString() ? `?${params.toString()}` : ""}`;
	const fileName = `reporte-ingresos-${from ?? "all"}-${to ?? "all"}.pdf`;
	return <PdfExportButton fileName={fileName} endpoint={endpoint} />;
}
