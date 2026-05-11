import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/react/primary/Badge";
import { Button } from "@/components/react/primary/Button";
import StaticCard from "@/components/react/primary/StaticCard";
import { Select, type SelectOption } from "@/components/react/primary/Select";

export type ReportTimeframe = "day" | "week" | "month" | "year";

const periodOptions: SelectOption[] = [
	{ value: "day", label: "Días" },
	{ value: "week", label: "Semanas" },
	{ value: "month", label: "Mes" },
	{ value: "year", label: "Año" },
];

const presetOptions: Record<ReportTimeframe, SelectOption[]> = {
	day: [
		{ value: "today", label: "Hoy" },
		{ value: "yesterday", label: "Ayer" },
		{ value: "last-7-days", label: "Últimos 7 días" },
	],
	week: [
		{ value: "current-week", label: "Semana actual" },
		{ value: "previous-week", label: "Semana anterior" },
		{ value: "last-4-weeks", label: "Últimas 4 semanas" },
	],
	month: [
		{ value: "current-month", label: "Mes actual" },
		{ value: "previous-month", label: "Mes anterior" },
		{ value: "last-3-months", label: "Últimos 3 meses" },
		{ value: "last-6-months", label: "Últimos 6 meses" },
	],
	year: [
		{ value: "current-year", label: "Año actual" },
		{ value: "previous-year", label: "Año anterior" },
		{ value: "last-3-years", label: "Últimos 3 años" },
		{ value: "last-5-years", label: "Últimos 5 años" },
	],
};

const summaryByPeriod: Record<ReportTimeframe, string> = {
	day: "Seguimiento granular de actividad reciente.",
	week: "Lectura operativa para ciclos cortos y tendencias.",
	month: "Vista ejecutiva para cierres y comparativos.",
	year: "Análisis histórico y comportamiento estructural.",
};

const defaultPresetByPeriod: Record<ReportTimeframe, string> = {
	day: "today",
	week: "current-week",
	month: "current-month",
	year: "current-year",
};

const pad = (value: number) => String(value).padStart(2, "0");

const formatDate = (date: Date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

const startOfUTCMonth = (date: Date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

const startOfUTCWeek = (date: Date) => {
	const current = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
	const diff = (current.getUTCDay() + 6) % 7;
	current.setUTCDate(current.getUTCDate() - diff);
	return current;
};

const shiftUTCDate = (date: Date, days: number) => {
	const next = new Date(date);
	next.setUTCDate(next.getUTCDate() + days);
	return next;
};

const getRangeFromPreset = (period: ReportTimeframe, preset: string) => {
	const today = new Date();
	const currentDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

	switch (preset) {
		case "yesterday":
			return { from: formatDate(shiftUTCDate(currentDay, -1)), to: formatDate(shiftUTCDate(currentDay, -1)) };
		case "last-7-days":
			return { from: formatDate(shiftUTCDate(currentDay, -6)), to: formatDate(currentDay) };
		case "current-week":
			return { from: formatDate(startOfUTCWeek(today)), to: formatDate(currentDay) };
		case "previous-week": {
			const previousWeekStart = shiftUTCDate(startOfUTCWeek(today), -7);
			const previousWeekEnd = shiftUTCDate(previousWeekStart, 6);
			return { from: formatDate(previousWeekStart), to: formatDate(previousWeekEnd) };
		}
		case "last-4-weeks":
			return { from: formatDate(shiftUTCDate(currentDay, -27)), to: formatDate(currentDay) };
		case "current-month":
			return { from: formatDate(startOfUTCMonth(today)), to: formatDate(currentDay) };
		case "previous-month": {
			const previousMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
			const previousMonthEnd = new Date(Date.UTC(previousMonth.getUTCFullYear(), previousMonth.getUTCMonth() + 1, 0));
			return { from: formatDate(previousMonth), to: formatDate(previousMonthEnd) };
		}
		case "last-3-months":
			return { from: formatDate(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 2, 1))), to: formatDate(currentDay) };
		case "last-6-months":
			return { from: formatDate(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 5, 1))), to: formatDate(currentDay) };
		case "current-year":
			return { from: formatDate(new Date(Date.UTC(today.getUTCFullYear(), 0, 1))), to: formatDate(currentDay) };
		case "previous-year":
			return { from: formatDate(new Date(Date.UTC(today.getUTCFullYear() - 1, 0, 1))), to: formatDate(new Date(Date.UTC(today.getUTCFullYear() - 1, 11, 31))) };
		case "last-3-years":
			return { from: formatDate(new Date(Date.UTC(today.getUTCFullYear() - 2, 0, 1))), to: formatDate(currentDay) };
		case "last-5-years":
			return { from: formatDate(new Date(Date.UTC(today.getUTCFullYear() - 4, 0, 1))), to: formatDate(currentDay) };
		case "today":
		default:
			if (period === "week") return { from: formatDate(startOfUTCWeek(today)), to: formatDate(currentDay) };
			if (period === "year") return { from: formatDate(new Date(Date.UTC(today.getUTCFullYear(), 0, 1))), to: formatDate(currentDay) };
			if (period === "day") return { from: formatDate(currentDay), to: formatDate(currentDay) };
			return { from: formatDate(startOfUTCMonth(today)), to: formatDate(currentDay) };
	}
};

interface ReportTimeframeFiltersProps {
	className?: string;
	title?: string;
	subtitle?: string;
	initialPeriod?: ReportTimeframe;
	initialPreset?: string;
}

export default function ReportTimeframeFilters({
	className = "",
	title = "Filtros temporales",
	subtitle = "Ajusta el periodo de análisis para revisar indicadores por día, semana, mes o año.",
	initialPeriod = "month",
	initialPreset,
}: ReportTimeframeFiltersProps) {
	const resolvedInitialPreset = initialPreset ?? defaultPresetByPeriod[initialPeriod];
	const [period, setPeriod] = useState<ReportTimeframe>(initialPeriod);
	const [preset, setPreset] = useState<string>(resolvedInitialPreset);
	const [appliedPeriod, setAppliedPeriod] = useState<ReportTimeframe>(initialPeriod);
	const [appliedPreset, setAppliedPreset] = useState<string>(resolvedInitialPreset);

	const activePresets = useMemo(() => presetOptions[period], [period]);

	useEffect(() => {
		const nextPreset = defaultPresetByPeriod[period];
		setPreset(nextPreset);
	}, [period]);

	useEffect(() => {
		if (!activePresets.some((option) => option.value === preset)) {
			setPreset(activePresets[0]?.value?.toString() ?? "");
		}
	}, [activePresets, preset]);

	const currentPresetLabel = activePresets.find((option) => option.value === preset)?.label ?? "Selecciona un rango";
	const appliedPresetLabel = presetOptions[appliedPeriod].find((option) => option.value === appliedPreset)?.label ?? "Sin aplicar";

	const applyFilters = () => {
		const range = getRangeFromPreset(period, preset);
		const url = new URL(window.location.href);
		url.searchParams.set("from", range.from);
		url.searchParams.set("to", range.to);
		url.searchParams.set("period", period);
		url.searchParams.set("preset", preset);
		window.location.href = url.toString();
	};

	return (
		<StaticCard>
			<div className={`space-y-5 ${className}`}>
				<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
					<div className="space-y-1">
						<h2 className="text-lg font-semibold text-gray-800">{title}</h2>
						<p className="text-sm text-cool-gray-60 max-w-2xl">{subtitle}</p>
					</div>
					<Badge styles={{ bg: "bg-primary-200", text: "text-primary-700", border: "border-primary-300" }}>
						{summaryByPeriod[appliedPeriod]}
					</Badge>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
					<Select
						label="Agrupar por"
						placeholder="Selecciona periodo"
						options={periodOptions}
						value={period}
						onChange={(value) => setPeriod(value as ReportTimeframe)}
					/>

					<Select
						label="Rango rápido"
						placeholder="Selecciona rango"
						options={activePresets}
						value={preset}
						onChange={(value) => setPreset(String(value))}
					/>

					<div className="flex flex-col gap-2">
						<span className="font-medium text-sm text-primary-700 px-1">Aplicar filtro</span>
						<Button
							label="Aplicar filtros"
							variant="primary"
							adaptive
							onClick={() => {
								setAppliedPeriod(period);
								setAppliedPreset(preset);
								applyFilters();
							}}
						/>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2 text-sm text-cool-gray-60">
					<span className="font-medium text-cool-gray-90">Filtro activo:</span>
					<Badge>{appliedPresetLabel}</Badge>
					<Badge styles={{ bg: "bg-cool-gray-90", text: "text-white", border: "border-cool-gray-70" }}>
						{periodOptions.find((option) => option.value === appliedPeriod)?.label ?? "Periodo"}
					</Badge>
					<span>{currentPresetLabel}</span>
				</div>
			</div>
		</StaticCard>
	);
}
