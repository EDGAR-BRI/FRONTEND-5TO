import { useEffect, useState } from "react";
import {
	FaHeartPulse,
	FaLungs,
	FaThermometer,
	FaWeightScale,
	FaRulerVertical,
	FaPills,
	FaBoxOpen,
	FaStethoscope,
	FaNotesMedical,
	FaUser,
	FaCalendarDays,
	FaClock,
	FaCheck,
} from "react-icons/fa6";
import { getConsultationById } from "@/lib/services/medical/consultation/consultation.service";
import { getSupplies } from "@/lib/services/inventory/supply/supply.service";
import type { ConsultationDetail } from "@/lib/services/medical/consultation/consultation.interface";
import type { Supply } from "@/lib/services/inventory/supply/supply.interface";
import StaticCard from "@/components/react/primary/StaticCard";

interface Props {
	consultationId: string;
	doctorId: string;
}

function formatDateTime(iso: string | null | undefined) {
	if (!iso) return { date: "-", time: "-" };
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return { date: "-", time: "-" };
	return {
		date: d.toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" }),
		time: d.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" }),
	};
}

function VitalCard({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: string | number | null | undefined; unit: string }) {
	if (value == null || value === "") return null;
	return (
		<div className="flex flex-col items-center gap-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
			<div className="text-primary-600">{icon}</div>
			<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
			<p className="text-sm font-black text-slate-800">{value} {unit}</p>
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const configs: Record<string, { label: string; className: string }> = {
		FINISHED: { label: "Completada", className: "text-emerald-600 bg-emerald-50" },
		IN_PROGRESS: { label: "En progreso", className: "text-blue-600 bg-blue-50" },
		PENDING: { label: "Pendiente", className: "text-amber-500 bg-amber-50" },
		CANCELLED: { label: "Cancelada", className: "text-red-600 bg-red-50" },
	};
	const config = configs[status] ?? { label: status, className: "text-slate-500 bg-slate-50" };
	return (
		<span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${config.className}`}>
			{config.label}
		</span>
	);
}

export default function ConsultationDetailView({ consultationId, doctorId }: Props) {
	const [consultation, setConsultation] = useState<ConsultationDetail | null>(null);
	const [supplyNames, setSupplyNames] = useState<Record<number, string>>({});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const id = Number(consultationId);
		if (!Number.isFinite(id) || id <= 0) {
			setError("ID de consulta inválido");
			setIsLoading(false);
			return;
		}

		let cancelled = false;
		setIsLoading(true);
		setError(null);

		Promise.all([getConsultationById(id), getSupplies()])
			.then(([data, supplies]) => {
				if (cancelled) return;
				setConsultation(data);
				const names: Record<number, string> = {};
				for (const s of supplies) {
					names[s.id] = s.name;
				}
				setSupplyNames(names);
			})
			.catch((e) => {
				if (cancelled) return;
				setError(e instanceof Error ? e.message : "Error cargando consulta");
			})
			.finally(() => {
				if (cancelled) return;
				setIsLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [consultationId]);

	if (isLoading) {
		return (
			<div className="flex flex-col gap-6 animate-pulse">
				<div className="h-32 bg-slate-100 rounded-xl" />
				<div className="h-48 bg-slate-100 rounded-xl" />
			</div>
		);
	}

	if (error || !consultation) {
		return (
			<div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600 text-center">
				{error ?? "Consulta no encontrada"}
			</div>
		);
	}

	const { date, started_at, finished_at } = consultation;
	const startTime = formatDateTime(started_at ?? date);
	const endTime = formatDateTime(finished_at);
	const patientName = consultation.invoice?.patient?.user?.name ?? consultation.invoice?.patient?.name ?? "Paciente";
	const doctorName = consultation.doctor?.user?.name ?? "Doctor";

	const exam = consultation.clinicalExaminations[0];

	return (
		<div className="grid grid-cols-2 gap-6">
			{/* Header */}
			<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 col-span-2">
				<div className="flex items-center gap-4 mb-4">
					<div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 shrink-0">
						<FaUser size={28} />
					</div>
					<div className="min-w-0">
						<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Paciente</p>
						<h4 className="text-xl font-black text-slate-800 leading-tight mb-1 truncate">{patientName}</h4>
						<StatusBadge status={consultation.status} />
					</div>
				</div>

				<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
					<div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
						<div className="text-primary-600"><FaCalendarDays size={18} /></div>
						<div>
							<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</p>
							<p className="text-sm font-bold text-slate-800">{startTime.date}</p>
						</div>
					</div>
					<div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
						<div className="text-primary-600"><FaClock size={18} /></div>
						<div>
							<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hora inicio</p>
							<p className="text-sm font-bold text-slate-800">{startTime.time}</p>
						</div>
					</div>
					{finished_at && (
						<div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-100 bg-emerald-50">
							<div className="text-emerald-600"><FaCheck size={18} /></div>
							<div>
								<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hora fin</p>
								<p className="text-sm font-bold text-emerald-700">{endTime.time}</p>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Examen clínico */}
			<StaticCard className="!p-0 overflow-hidden col-span-2">
				<div className="bg-primary-600 px-6 py-4 border-b border-primary-200 flex items-center gap-2">
					<FaHeartPulse className="text-primary-100" />
					<h2 className="text-lg font-bold text-primary-100">Examen Clínico</h2>
				</div>
				<div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
					<VitalCard icon={<FaWeightScale size={18} />} label="Peso" value={exam?.weight} unit="kg" />
					<VitalCard icon={<FaRulerVertical size={18} />} label="Altura" value={exam?.height} unit="cm" />
					<VitalCard icon={<FaThermometer size={18} />} label="Temperatura" value={exam?.temperature} unit="°C" />
					<VitalCard icon={<FaLungs size={18} />} label="Sat. O2" value={exam?.oxygen_saturation} unit="%" />
					<VitalCard icon={<FaHeartPulse size={18} />} label="Presión sist." value={exam?.systolic_bp} unit="mmHg" />
					<VitalCard icon={<FaHeartPulse size={18} />} label="Presión diast." value={exam?.diastolic_bp} unit="mmHg" />
					<VitalCard icon={<FaHeartPulse size={18} />} label="Frec. card." value={exam?.heart_rate} unit="lpm" />
					<VitalCard icon={<FaHeartPulse size={18} />} label="Frec. resp." value={exam?.respiratory_rate} unit="rpm" />
				</div>
				{exam && Object.values(exam).every((v) => v == null) && (
					<p className="text-sm text-slate-400 text-center py-4 px-6">Sin datos de examen clínico.</p>
				)}
			</StaticCard>

			{/* Síntomas */}
			<StaticCard className="!p-0 overflow-hidden">
				<div className="bg-primary-600 px-6 py-4 border-b border-primary-200 flex items-center gap-2">
					<FaNotesMedical className="text-primary-100" />
					<h2 className="text-lg font-bold text-primary-100">Síntomas Reportados</h2>
				</div>
				<div className="p-6 space-y-3">
					{consultation.symptomsConsultations.length === 0 ? (
						<p className="text-sm text-slate-400 text-center py-4">No hay síntomas registrados.</p>
					) : (
						consultation.symptomsConsultations.map((s) => (
							<div key={s.id} className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
								<div className="flex-1 min-w-0">
									<p className="font-semibold text-slate-700">{s.symptom?.name ?? "Síntoma"}</p>
									<div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
										<span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
											s.severity === "Severo" ? "text-red-600 bg-red-50" :
											s.severity === "Moderado" ? "text-amber-600 bg-amber-50" :
											"text-emerald-600 bg-emerald-50"
										}`}>{s.severity}</span>
										<span>•</span>
										<span>{s.duration}</span>
										{s.notes && <><span>•</span><span className="italic">{s.notes}</span></>}
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</StaticCard>

			{/* Diagnósticos */}
			<StaticCard className="!p-0 overflow-hidden">
				<div className="bg-primary-600 px-6 py-4 border-b border-primary-200 flex items-center gap-2">
					<FaStethoscope className="text-primary-100" />
					<h2 className="text-lg font-bold text-primary-100">Diagnósticos</h2>
				</div>
				<div className="p-6 space-y-3">
					{consultation.consultationDiagnoses.length === 0 ? (
						<p className="text-sm text-slate-400 text-center py-4">No hay diagnósticos registrados.</p>
					) : (
						consultation.consultationDiagnoses.map((d) => (
							<div key={d.id} className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-1">
										<p className="font-semibold text-slate-700">{d.diagnosis?.description ?? "Diagnóstico"}</p>
										{d.is_primary && (
											<span className="text-[10px] font-black uppercase tracking-widest text-primary-700 bg-primary-50 px-2 py-0.5 rounded">Principal</span>
										)}
									</div>
									<div className="flex items-center gap-2 text-xs text-slate-500">
										<span className="bg-slate-200 text-slate-600 px-1.5 rounded font-mono">{d.diagnosis?.code}</span>
										<span>•</span>
										<span>Estado: {d.condition_status ?? "-"}</span>
										{d.onset_date && <><span>•</span><span>Desde: {new Date(d.onset_date).toLocaleDateString("es-VE")}</span></>}
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</StaticCard>

			{/* Insumos consumidos */}
			<StaticCard className="!p-0 overflow-hidden">
				<div className="bg-primary-600 px-6 py-4 border-b border-primary-200 flex items-center gap-2">
					<FaBoxOpen className="text-primary-100" />
					<h2 className="text-lg font-bold text-primary-100">Insumos Consumidos</h2>
				</div>
				<div className="p-6 space-y-3">
					{consultation.supplies.length === 0 ? (
						<p className="text-sm text-slate-400 text-center py-4">No se consumieron insumos.</p>
					) : (
						<div className="space-y-2">
							<div className="grid grid-cols-3 gap-4 px-3 py-2 bg-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
								<span>Insumo</span>
								<span>Cantidad</span>
								<span>ID</span>
							</div>
							{consultation.supplies.map((s) => (
								<div key={s.id} className="grid grid-cols-3 gap-4 px-3 py-3 bg-slate-50 rounded-lg border border-slate-100 items-center">
									<span className="font-semibold text-slate-700">{supplyNames[s.supplyId] ?? `Insumo #${s.supplyId}`}</span>
									<span className="text-sm font-bold text-primary-700">{s.quantity}</span>
									<span className="text-xs text-slate-400 font-mono">#{s.supplyId}</span>
								</div>
							))}
						</div>
					)}
				</div>
			</StaticCard>

			{/* Recetas */}
			<StaticCard className="!p-0 overflow-hidden">
				<div className="bg-primary-600 px-6 py-4 border-b border-primary-200 flex items-center gap-2">
					<FaPills className="text-primary-100" />
					<h2 className="text-lg font-bold text-primary-100">Receta Médica</h2>
				</div>
				<div className="p-6 space-y-4">
					{consultation.prescriptions.length === 0 ? (
						<p className="text-sm text-slate-400 text-center py-4">No se emitieron recetas.</p>
					) : (
						consultation.prescriptions.map((p) => (
							<div key={p.id} className="flex flex-col gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
								<div className="flex items-center justify-between">
									<p className="font-bold text-slate-800 text-lg">{p.medication_name ?? "Medicamento"}</p>
									{p.active ? (
										<span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Activa</span>
									) : (
										<span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Inactiva</span>
									)}
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
									{p.dosage && (
										<div className="flex items-center gap-2 text-slate-600">
											<span className="text-[10px] font-black text-slate-400 uppercase">Dosis:</span>
											<span className="font-medium">{p.dosage}</span>
										</div>
									)}
									{p.frequency && (
										<div className="flex items-center gap-2 text-slate-600">
											<span className="text-[10px] font-black text-slate-400 uppercase">Frec.:</span>
											<span className="font-medium">{p.frequency}</span>
										</div>
									)}
									{p.duration && (
										<div className="flex items-center gap-2 text-slate-600">
											<span className="text-[10px] font-black text-slate-400 uppercase">Duración:</span>
											<span className="font-medium">{p.duration}</span>
										</div>
									)}
								</div>
								{p.instructions && (
									<p className="text-xs text-slate-500 italic border-t border-slate-200 pt-2">
										{p.instructions}
									</p>
								)}
							</div>
						))
					)}
				</div>
			</StaticCard>
		</div>
	);
}