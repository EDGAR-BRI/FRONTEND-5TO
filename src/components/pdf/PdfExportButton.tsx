import { useState } from "react";
import { Button } from "@/components/react/primary/Button";
import { Alert } from "@/utils/alerts";
import { FaFilePdf } from "react-icons/fa6";
import { api } from "@/lib/api";

interface PdfExportButtonProps {
	label?: string;
	fileName: string;
	endpoint: string;
}

const downloadBlob = (blob: Blob, fileName: string) => {
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = fileName;
	anchor.click();
	window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export default function PdfExportButton({
	label = "Exportar PDF",
	fileName,
	endpoint,
}: PdfExportButtonProps) {
	const [loading, setLoading] = useState(false);

	const handleExport = async () => {
		try {
			setLoading(true);
			const response = await api(endpoint, { method: "GET" });
			if (!response.ok) {
				throw new Error(await response.text());
			}
			const blob = await response.blob();
			downloadBlob(blob, fileName);
			await Alert.success("PDF generado", "La descarga comenzó correctamente.", 1600);
		} catch (error) {
			await Alert.error("No se pudo generar el PDF", error instanceof Error ? error.message : "Intenta nuevamente.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Button label={label} variant="secondary" loading={loading} onClick={handleExport}>
			<FaFilePdf size={14} /> {label}
		</Button>
	);
}
