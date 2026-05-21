import { useMemo, useState } from "react";
import {
	FaCalendarDays,
	FaChevronRight,
	FaMagnifyingGlass,
	FaUser,
} from "react-icons/fa6";
import ActionCard from "../primary/ActionCard";
import type { PatientWithConsultations } from "@/hooks/react/doctor/usePatientConsultations";

interface Props {
	patients: PatientWithConsultations[];
	doctorId: string | number;
	title?: string;
	emptyMessage?: string;
}

function PatientCard({
	patient,
	onClick,
}: {
	patient: PatientWithConsultations;
	onClick: () => void;
}) {
	return (
		<ActionCard
			className="flex-wrap! gap-y-3 cursor-pointer border border-slate-200 hover:border-[#1e3a8a]/30 hover:shadow-md transition-all p-4!"
			onClick={onClick}
		>
			<div className="flex flex-1 items-center gap-5 min-w-0 w-full sm:w-auto">
				<div className="w-12 h-12 shrink-0 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors">
					<FaUser size={22} />
				</div>

				<div className="min-w-0 flex flex-col gap-1.5">
					<h4 className="font-black text-[#1e293b] text-[15px] truncate">
						{patient.name}
					</h4>
					<div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
						<FaCalendarDays
							size={14}
							className="text-[#3b82f6]"
						/>
						{patient.lastVisit ?? "Sin visitas"}
					</div>
					<p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
						{patient.consultationCount} consulta
						{patient.consultationCount !== 1 ? "s" : ""}
					</p>
				</div>
			</div>

			<div className="flex items-center gap-4 shrink-0 ml-auto">
				<FaChevronRight
					size={18}
					className="text-slate-300 group-hover:text-[#1e3a8a] transition-colors"
				/>
			</div>
		</ActionCard>
	);
}

export function PatientList({
	patients,
	doctorId,
	title = "Pacientes",
	emptyMessage = "No hay pacientes para mostrar.",
}: Props) {
	const [search, setSearch] = useState("");

	const filteredPatients = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return patients;
		return patients.filter((p) =>
			p.name.toLowerCase().includes(q)
		);
	}, [patients, search]);

	return (
		<>
			<div className="flex flex-col gap-6">
				<div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
					<div className="relative w-full sm:w-96">
						<FaMagnifyingGlass
							className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
							size={18}
						/>
						<input
							type="text"
							placeholder="Buscar por nombre del paciente..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all"
						/>
					</div>
				</div>

				<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
					<div className="flex justify-between items-center mb-6">
						<h2 className="font-bold text-[#1e293b] text-base flex items-center gap-2 uppercase tracking-wide">
							<FaUser size={20} className="text-[#1e3a8a]" /> {title}
						</h2>
					</div>

					<div className="space-y-4">
						{filteredPatients.length === 0 ? (
							<div className="text-sm text-slate-500 text-center py-8">
								{emptyMessage}
							</div>
						) : (
							filteredPatients.map((p) => (
								<PatientCard
									key={p.id}
									patient={p}
									onClick={() => {
										window.location.replace(
											`/modules/doctor/${doctorId}/patients/${p.id}/history`
										);
									}}
								/>
							))
						)}
					</div>
				</div>
			</div>
		</>
	);
}
