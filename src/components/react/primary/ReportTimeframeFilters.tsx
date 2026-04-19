import { useEffect, useMemo, useState } from "react";
import { Select, type SelectOption } from "@/components/react/primary/Select";
import { Badge } from "@/components/react/primary/Badge";
import { Button } from "@/components/react/primary/Button";
import StaticCard from "@/components/react/primary/StaticCard";

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
		{ value: "custom-day", label: "Rango diario" },
	],
	week: [
		{ value: "current-week", label: "Semana actual" },
		{ value: "previous-week", label: "Semana anterior" },
		{ value: "last-4-weeks", label: "Últimas 4 semanas" },
		{ value: "custom-week", label: "Rango semanal" },
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

interface ReportTimeframeFiltersProps {
	className?: string;
	title?: string;
	subtitle?: string;
	initialPeriod?: ReportTimeframe;
}

export default function ReportTimeframeFilters({
	className = "",
	title = "Filtros temporales",
	subtitle = "Ajusta el periodo de análisis para revisar indicadores por día, semana, mes o año.",
	initialPeriod = "month",
}: ReportTimeframeFiltersProps) {
	const [period, setPeriod] = useState<ReportTimeframe>(initialPeriod);
	const [preset, setPreset] = useState<string>(defaultPresetByPeriod[initialPeriod]);
	const [appliedPeriod, setAppliedPeriod] = useState<ReportTimeframe>(initialPeriod);
	const [appliedPreset, setAppliedPreset] = useState<string>(defaultPresetByPeriod[initialPeriod]);

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
