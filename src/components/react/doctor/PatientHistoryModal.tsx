import {
	FaCalendarDays,
	FaChevronRight,
	FaFileLines,
	FaRegClock,
	FaStethoscope,
	FaUser,
} from "react-icons/fa6";
import { Modal } from "../primary/Modal";
import type { PatientWithConsultations } from "@/hooks/react/doctor/usePatientConsultations";
import type { ConsultationSummary } from "@/lib/services/medical/consultation/consultation.interface";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	patient: PatientWithConsultations | null;
	doctorId: string | number;
}

function formatDateParts(value: string | null | undefined) {
	const d = value ? new Date(value) : null;
	if (!d || Number.isNaN(d.getTime())) return { date: "-", time: "-" };

	const date = d.toLocaleDateString("es-VE", {
		weekday: "short",
		day: "2-digit",
		month: "short",
	});
	const time = d.toLocaleTimeString("es-VE", {
		hour: "2-digit",
		minute: "2-digit",
	});

	return { date, time };
}

function ConsultationRow({
	consultation,
	onView,
}: {
	consultation: ConsultationSummary;
	onView: () => void;
}) {
	const finished = consultation.status === "FINISHED";
	const statusColor = finished
		? "text-emerald-600 bg-emerald-50"
		: "text-blue-600 bg-blue-50";
	const statusLabel = finished ? "COMPLETADA" : "PENDIENTE";

	const dateSource = consultation.started_at ?? consultation.date;
	const { date, time } = formatDateParts(dateSource);

	return (
		<div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-[#1e3a8a]/30 hover:shadow-sm transition-all">
			<div className="w-12 h-12 shrink-0 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 border border-slate-100">
				<FaUser size={22} />
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2 mb-1">
					<span
						className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${statusColor}`}
					>
						{statusLabel}
					</span>
					<span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
						{date}
					</span>
				</div>
				<p className="text-sm font-black text-[#1e293b] truncate">
					Consulta #{consultation.id}
				</p>
				<div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
					<FaRegClock size={12} className="text-[#3b82f6]" />
					{time}
				</div>
			</div>

			<button
				onClick={onView}
				className="shrink-0 flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#1e3a8a] bg-[#e0f2fe] rounded-lg hover:bg-[#bae6fd] transition-colors"
			>
				Ver <FaChevronRight size={14} />
			</button>
		</div>
	);
}

export function PatientHistoryModal({
	isOpen,
	onClose,
	patient,
	doctorId,
}: Props) {
	if (!patient) return null;

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={`Historial de ${patient.name}`}>
			<div className="space-y-6 animate-in fade-in duration-300">
				<div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
					<div className="w-14 h-14 shrink-0 bg-[#1e3a8a] rounded-full flex items-center justify-center text-white">
						<FaUser size={28} />
					</div>
					<div>
						<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
							Paciente
						</p>
						<h4 className="text-xl font-black text-[#1e293b] leading-tight">
							{patient.name}
						</h4>
						<p className="text-xs text-slate-500 mt-1">
							{patient.consultationCount} consulta
							{patient.consultationCount !== 1 ? "s" : ""} • Última
							visita:{" "}
							<span className="font-bold text-[#1e3a8a]">
								{patient.lastVisit ?? "Sin registros"}
							</span>
						</p>
					</div>
				</div>

				<div>
					<h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
						<FaFileLines size={12} /> Registro de Consultas
					</h5>

					{patient.consultations.length === 0 ? (
						<div className="text-sm text-slate-500 text-center py-8">
							No hay consultas registradas.
						</div>
					) : (
						<div className="space-y-3">
							{patient.consultations
								.sort((a, b) => {
									const dateA = new Date(a.started_at ?? a.date).getTime();
									const dateB = new Date(b.started_at ?? b.date).getTime();
									return dateB - dateA;
								})
								.map((c) => (
									<ConsultationRow
										key={c.id}
										consultation={c}
										onView={() => {
											window.location.replace(
												`/modules/doctor/${doctorId}/consultation/${c.id}`
											);
										}}
									/>
								))}
						</div>
					)}
				</div>

				<div className="pt-2 flex justify-end">
					<button
						onClick={onClose}
						className="px-6 py-2 text-sm font-bold text-[#1e3a8a] bg-white border-2 border-[#1e3a8a] rounded-lg hover:bg-blue-50 transition-colors"
					>
						Cerrar
					</button>
				</div>
			</div>
		</Modal>
	);
}
