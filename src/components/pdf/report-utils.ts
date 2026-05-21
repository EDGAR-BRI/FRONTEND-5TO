import type { CSSProperties } from "react";

export type PdfColorBand = "primary" | "success" | "warning" | "danger" | "neutral";

export const palette: Record<PdfColorBand, { bg: string; text: string; border: string }> = {
	primary: { bg: "#dbeafe", text: "#1d4ed8", border: "#bfdbfe" },
	success: { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0" },
	warning: { bg: "#fef3c7", text: "#b45309", border: "#fde68a" },
	danger: { bg: "#fee2e2", text: "#b91c1c", border: "#fecaca" },
	neutral: { bg: "#f3f4f6", text: "#374151", border: "#e5e7eb" },
};

export const formatUsd = (value: number) =>
	new Intl.NumberFormat("es-VE", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 2,
	}).format(value);

export const formatPct = (value: number) => `${value.toFixed(1)}%`;

export const baseText: CSSProperties = {
	fontSize: 10,
	color: "#1f2937",
};
