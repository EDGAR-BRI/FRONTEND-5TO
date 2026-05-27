import { useMemo } from "react";
import { useSWRConfig } from "swr";
import { FaFileLines, FaPills, FaStethoscope } from "react-icons/fa6";
import { ConsultationTimeline } from "./ConsultationTimeline";
import { usePatientInfo } from "@/hooks/react/doctor/usePatientInfo";
import { usePatientConsultationHistory } from "@/hooks/react/doctor/usePatientConsultationHistory";
import type {
	PatientConsultationHistory,
	PatientDiagnosisDto,
} from "@/lib/services/medical/consultation/consultation.interface";

interface Props {
	patientId: number | null;
	doctorId: string | number;
}

const EMPTY_VALUE = "Sin registros";

function getAge(birthDate?: Date | string | null) {
	if (!birthDate) return "-";
	const date = new Date(birthDate);
	if (Number.isNaN(date.getTime())) return "-";
	const diff = new Date().getTime() - date.getTime();
	return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function formatDate(value: string | Date | null | undefined) {
	const date = value ? new Date(value) : null;
	if (!date || Number.isNaN(date.getTime())) return "-";
	return date.toLocaleDateString("es-VE", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

function PatientSummaryCard({
	isLoading,
	error,
	data,
	onRetry,
}: {
	isLoading: boolean;
	error?: Error;
	data?: {
		age: number | string;
		sex: string;
		allergies: string;
		chronic: string;
		phone: string;
	};
	onRetry: () => void;
}) {
	if (isLoading) {
		return (
			<div className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse space-y-4">
				<div className="h-4 w-28 bg-slate-200 rounded" />
				<div className="h-3 w-full bg-slate-100 rounded" />
				<div className="h-3 w-4/5 bg-slate-100 rounded" />
				<div className="h-3 w-3/5 bg-slate-100 rounded" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-white rounded-xl border border-rose-200 p-4">
				<p className="text-sm text-rose-600 font-bold">Error cargando resumen</p>
				<button
					onClick={onRetry}
					className="mt-3 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100"
				>
					Reintentar
				</button>
			</div>
		);
	}

	if (!data) {
		return (
			<div className="bg-white rounded-xl border border-slate-200 p-4 text-sm text-slate-500">
				Sin informacion registrada.
			</div>
		);
	}

	return (
		<div className="bg-white rounded-xl border border-slate-200 p-4">
			<p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
				Resumen rapido
			</p>
			<div className="space-y-3 text-sm text-slate-600">
				<div className="flex items-center justify-between">
					<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
						Edad / Sexo
					</span>
					<span className="font-semibold">{data.age} · {data.sex}</span>
				</div>
				<div className="flex items-start justify-between gap-3">
					<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
						Alergias
					</span>
					<span className="text-right font-semibold">{data.allergies}</span>
				</div>
				<div className="flex items-start justify-between gap-3">
					<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
						Cronicas
					</span>
					<span className="text-right font-semibold">{data.chronic}</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
						Telefono
					</span>
					<span className="font-semibold">{data.phone}</span>
				</div>
			</div>
		</div>
	);
}

function ActiveMedicationsCard({
	isLoading,
	error,
	medications,
	onRetry,
}: {
	isLoading: boolean;
	error?: Error;
	medications: string[];
	onRetry: () => void;
}) {
	if (isLoading) {
		return (
			<div className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse space-y-3">
				<div className="h-4 w-32 bg-slate-200 rounded" />
				<div className="h-3 w-full bg-slate-100 rounded" />
				<div className="h-3 w-4/5 bg-slate-100 rounded" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-white rounded-xl border border-rose-200 p-4">
				<p className="text-sm text-rose-600 font-bold">Error cargando medicamentos</p>
				<button
					onClick={onRetry}
					className="mt-3 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100"
				>
					Reintentar
				</button>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-xl border border-slate-200 p-4">
			<p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
				<FaPills size={12} /> Medicamentos activos
			</p>
			{medications.length === 0 ? (
				<p className="text-sm text-slate-500">Sin medicamentos activos</p>
			) : (
				<ul className="space-y-2 text-sm text-slate-700">
					{medications.map((med) => (
						<li key={med} className="flex items-center gap-2">
							<span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
							<span>{med}</span>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

function DiagnosesList({
	isLoading,
	error,
	diagnoses,
	onRetry,
}: {
	isLoading: boolean;
	error?: Error;
	diagnoses: { status: string; items: PatientDiagnosisDto[] }[];
	onRetry: () => void;
}) {
	if (isLoading) {
		return (
			<div className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse space-y-3">
				<div className="h-4 w-24 bg-slate-200 rounded" />
				<div className="h-3 w-full bg-slate-100 rounded" />
				<div className="h-3 w-4/5 bg-slate-100 rounded" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-white rounded-xl border border-rose-200 p-4">
				<p className="text-sm text-rose-600 font-bold">Error cargando diagnosticos</p>
				<button
					onClick={onRetry}
					className="mt-3 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100"
				>
					Reintentar
				</button>
			</div>
		);
	}

	const normalized = diagnoses
		.map((group) => ({
			status: group.status,
			items: [...group.items].sort((a, b) => {
				const nameA = a.diagnosis?.description ?? "";
				const nameB = b.diagnosis?.description ?? "";
				return nameA.localeCompare(nameB);
			}),
		}))
		.sort((a, b) => a.status.localeCompare(b.status));

	return (
		<div className="bg-white rounded-xl border border-slate-200 p-4">
			<p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
				<FaStethoscope size={12} /> Diagnosticos
			</p>
			{normalized.length === 0 ? (
				<p className="text-sm text-slate-500">Sin diagnosticos registrados</p>
			) : (
				<div className="space-y-4">
					{normalized.map((group) => (
						<div key={group.status}>
							<p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
								{group.status}
							</p>
							<ul className="space-y-2 text-sm text-slate-700">
								{group.items.map((d) => (
									<li key={d.id} className="flex items-center gap-2">
										<span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
										<span>{d.diagnosis?.description ?? "Diagnostico"}</span>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function TimelineCard({
	isLoading,
	error,
	consultations,
	doctorId,
	onRetry,
}: {
	isLoading: boolean;
	error?: Error;
	consultations: PatientConsultationHistory[];
	doctorId: string | number;
	onRetry: () => void;
}) {
	if (isLoading) {
		return (
			<div className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse space-y-3">
				<div className="h-4 w-40 bg-slate-200 rounded" />
				<div className="h-20 w-full bg-slate-100 rounded" />
				<div className="h-20 w-full bg-slate-100 rounded" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-white rounded-xl border border-rose-200 p-4">
				<p className="text-sm text-rose-600 font-bold">Error cargando historial</p>
				<button
					onClick={onRetry}
					className="mt-3 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100"
				>
					Reintentar
				</button>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-xl border border-slate-200 p-4">
			<p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
				<FaFileLines size={12} /> Linea de tiempo
			</p>
			<ConsultationTimeline consultations={consultations} doctorId={doctorId} />
		</div>
	);
}

export function PatientHistoryModal({ patientId, doctorId }: Props) {
	const { mutate } = useSWRConfig();
	const { data: patientInfo, isLoading: isInfoLoading, error: infoError } =
		usePatientInfo(patientId);
	const {
		consultations,
		isLoading: isConsultationsLoading,
		error: consultationsError,
	} = usePatientConsultationHistory(patientId);

	const patientName =
		patientInfo?.patient?.user?.name
			?? patientInfo?.patient?.name
			?? "Paciente";
	const patientCi =
		patientInfo?.patient?.user?.ci
			?? patientInfo?.patient?.ci
			?? "Sin C.I.";

	const lastVisit = useMemo(() => {
		const fromInfo = patientInfo?.patient?.last_visit_at ?? patientInfo?.last_visit_at ?? null;
		if (fromInfo) return formatDate(fromInfo);
		if (consultations.length === 0) return "-";
		const sorted = [...consultations].sort((a, b) =>
			new Date(b.started_at ?? b.date).getTime() - new Date(a.started_at ?? a.date).getTime()
		);
		return formatDate(sorted[0]?.started_at ?? sorted[0]?.date ?? null);
	}, [patientInfo, consultations]);

	const summaryData = patientInfo
		? {
			age: getAge(patientInfo.birth_date),
			sex:
				patientInfo.sex === "FEMALE"
					? "Femenino"
					: patientInfo.sex === "MALE"
					? "Masculino"
					: "-",
			allergies: patientInfo.allergies || EMPTY_VALUE,
			chronic: patientInfo.chronic_diseases || EMPTY_VALUE,
			phone: patientInfo.main_phone || "-",
		}
		: undefined;

	const activeMedications = useMemo(() => {
		const set = new Set<string>();
		for (const consultation of consultations) {
			for (const prescription of consultation.prescriptions) {
				if (!prescription.active) continue;
				const name = prescription.medication_name ?? "Medicamento";
				const dosage = prescription.dosage ? ` ${prescription.dosage}` : "";
				set.add(`${name}${dosage}`.trim());
			}
		}
		return Array.from(set.values());
	}, [consultations]);

	const diagnoses = useMemo(() => {
		const grouped = new Map<string, Map<number, PatientDiagnosisDto>>();
		for (const consultation of consultations) {
			for (const diagnosis of consultation.consultationDiagnoses) {
				const status = (diagnosis.condition_status || "Sin estado").toUpperCase();
				if (!grouped.has(status)) grouped.set(status, new Map());
				const bucket = grouped.get(status)!;
				if (!bucket.has(diagnosis.id)) bucket.set(diagnosis.id, diagnosis);
			}
		}
		return Array.from(grouped.entries()).map(([status, items]) => ({
			status,
			items: Array.from(items.values()),
		}));
	}, [consultations]);

	const initials = patientName
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	const infoKey = patientId !== null ? `/medical/info-patient/patient/${patientId}` : null;
	const consultationsKey = patientId !== null ? `/medical/consultation/patient/${patientId}` : null;

	return (
		<div className="space-y-6 animate-in fade-in duration-300">
			<div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white">
				<div className="w-14 h-14 shrink-0 bg-[#1e3a8a] rounded-full flex items-center justify-center text-white text-xl font-black">
					{initials}
				</div>
				<div>
					<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
						Paciente
					</p>
					<h4 className="text-xl font-black text-[#1e293b] leading-tight">
						{patientName}
					</h4>
					<p className="text-xs text-slate-500 mt-1">
						{patientCi} • {consultations.length} consulta
						{consultations.length !== 1 ? "s" : ""} • Ultima visita:{" "}
						<span className="font-bold text-[#1e3a8a]">{lastVisit}</span>
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="space-y-6">
					<PatientSummaryCard
						isLoading={isInfoLoading}
						error={infoError}
						data={summaryData}
						onRetry={() => infoKey && mutate(infoKey)}
					/>

					<ActiveMedicationsCard
						isLoading={isConsultationsLoading}
						error={consultationsError}
						medications={activeMedications}
						onRetry={() => consultationsKey && mutate(consultationsKey)}
					/>

					<DiagnosesList
						isLoading={isConsultationsLoading}
						error={consultationsError}
						diagnoses={diagnoses}
						onRetry={() => consultationsKey && mutate(consultationsKey)}
					/>
				</div>

				<div className="lg:col-span-2 space-y-6">
					<TimelineCard
						isLoading={isConsultationsLoading}
						error={consultationsError}
						consultations={consultations}
						doctorId={doctorId}
						onRetry={() => consultationsKey && mutate(consultationsKey)}
					/>
				</div>
			</div>
		</div>
	);
}
