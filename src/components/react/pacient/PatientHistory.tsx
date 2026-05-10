import { useState } from "react";
import {
    FaCalendarAlt,
    FaUserMd,
    FaChevronDown,
    FaChevronUp,
    FaPills,
    FaStethoscope,
    FaHeartbeat,
    FaClipboardList,
    FaThermometerHalf,
    FaWeight,
    FaRulerVertical,
    FaLungs,
    FaMedkit,
    FaBookmark,
    FaFileMedical,
} from "react-icons/fa";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import useSWR from "swr";
import { listConsultationsByPatient, type PatientConsultationHistory } from "@/lib/services/medical/consultation/consultation.service";
import { StatsCard } from "@/components/react/primary/StatsCard";

interface PatientHistoryProps {
    patientId: number;
}

const SPECIALTY_COLORS: Record<string, string> = {
    "Medicina General": "bg-blue-500",
    "Pediatria": "bg-purple-500",
    "Cardiologia": "bg-red-500",
    "Traumatologia": "bg-orange-500",
};

const CONDITION_COLORS: Record<string, string> = {
    "Agudo": "bg-green-100 text-green-700 border-green-200",
    "Cronico": "bg-amber-100 text-amber-700 border-amber-200",
    "Controlado": "bg-blue-100 text-blue-700 border-blue-200",
};

const SEVERITY_COLORS: Record<string, string> = {
    "Alta": "text-red-600",
    "Media": "text-amber-600",
    "Baja": "text-green-600",
};

const formatDate = (dateStr: string) => {
    try {
        return format(new Date(dateStr), "d 'de' MMMM 'de' yyyy", { locale: es });
    } catch {
        return dateStr;
    }
};

const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "--";
    try {
        return format(new Date(dateStr), "HH:mm");
    } catch {
        return "--";
    }
};

function getDurationMinutes(started: string | null, finished: string | null): string {
    if (!started || !finished) return "";
    const diffMs = new Date(finished).getTime() - new Date(started).getTime();
    const mins = Math.round(diffMs / 60000);
    return mins + " min";
}

function VitalsDisplay({ exam }: { exam: PatientConsultationHistory["clinicalExaminations"][number] }) {
    const vitals = [
        exam.weight ? { icon: FaWeight, label: exam.weight + " kg", color: "text-blue-600" } : null,
        exam.height ? { icon: FaRulerVertical, label: exam.height + " m", color: "text-blue-600" } : null,
        exam.temperature ? { icon: FaThermometerHalf, label: exam.temperature + " C", color: "text-orange-600" } : null,
        exam.systolic_bp && exam.diastolic_bp
            ? { icon: FaHeartbeat, label: exam.systolic_bp + "/" + exam.diastolic_bp, color: "text-red-600" }
            : null,
        exam.heart_rate ? { icon: FaMedkit, label: exam.heart_rate + " lpm", color: "text-pink-600" } : null,
        exam.respiratory_rate ? { icon: FaLungs, label: exam.respiratory_rate + " rpm", color: "text-cyan-600" } : null,
        exam.oxygen_saturation ? { icon: FaLungs, label: exam.oxygen_saturation + "%", color: "text-indigo-600" } : null,
    ];

    const validVitals = vitals.filter((v): v is NonNullable<typeof v> => v !== null);

    if (validVitals.length === 0) {
        return <span className="text-primary-400 text-xs italic">Sin registro de signos vitales</span>;
    }

    return (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {validVitals.map((v, i) => {
                const Icon = v.icon;
                return (
                    <span key={i} className={"flex items-center gap-1.5 text-xs font-medium " + v.color}>
                        <Icon size={12} />
                        {v.label}
                    </span>
                );
            })}
        </div>
    );
}

function DiagnosisBadge({ diagnosis }: { diagnosis: PatientConsultationHistory["consultationDiagnoses"][number] }) {
    const conditionKey = diagnosis.condition_status || "";
    const conditionColor = CONDITION_COLORS[conditionKey] || "bg-gray-100 text-gray-600 border-gray-200";

    return (
        <div className="flex items-start gap-2">
            <span className={"mt-0.5 shrink-0 w-2 h-2 rounded-full " + (diagnosis.is_primary ? "bg-primary-500" : "bg-gray-300")} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2">
                    {diagnosis.is_primary && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary-100 text-primary-700">
                            <FaBookmark size={8} /> Principal
                        </span>
                    )}
                    <span className={"text-xs font-medium px-2 py-0.5 rounded border " + conditionColor}>
                        {diagnosis.condition_status || "Sin estado"}
                    </span>
                </div>
                <p className="text-sm font-medium text-primary-800 mt-1 leading-snug">
                    {diagnosis.diagnosis.description}
                </p>
                {diagnosis.diagnosis.code && (
                    <span className="text-[10px] font-mono text-primary-400">{diagnosis.diagnosis.code}</span>
                )}
            </div>
        </div>
    );
}

function PrescriptionCard({ prescription }: { prescription: PatientConsultationHistory["prescriptions"][number] }) {
    const isActive = prescription.active;
    const activeClass = isActive
        ? "bg-green-100 text-green-700 border-green-200"
        : "bg-gray-100 text-gray-500 border-gray-200";

    return (
        <div className="bg-gradient-to-r from-primary-50 to-white border-l-4 border-primary-500 rounded-r-lg p-3 text-sm shadow-sm">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-primary-800 leading-tight">
                        {prescription.medication_name || "Medicamento sin nombre"}
                    </p>
                    {prescription.dosage && (
                        <p className="text-xs text-primary-600 mt-1 font-medium">{prescription.dosage}</p>
                    )}
                </div>
                <span className={"shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full border " + activeClass}>
                    {isActive ? "Activa" : "Inactiva"}
                </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-primary-500">
                {prescription.frequency && (
                    <span className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-primary-400" />
                        {prescription.frequency}
                    </span>
                )}
                {prescription.duration && (
                    <span className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-primary-400" />
                        {prescription.duration}
                    </span>
                )}
            </div>
            {prescription.instructions && (
                <p className="mt-2 text-[11px] text-primary-400 italic leading-relaxed">{prescription.instructions}</p>
            )}
        </div>
    );
}

function TimelineNode({ consultation, isLast }: { consultation: PatientConsultationHistory; isLast: boolean }) {
    const [expanded, setExpanded] = useState(false);

    const primaryDiagnosis = consultation.consultationDiagnoses.find((d) => d.is_primary);
    const specialtyName = consultation.doctor.specialty.name;
    const specialtyColor = SPECIALTY_COLORS[specialtyName] || "bg-gray-500";
    const duration = getDurationMinutes(consultation.started_at, consultation.finished_at);

    return (
        <div className="relative flex gap-0">
            <div className="relative flex flex-col items-center">
                <div className={"w-10 h-10 rounded-full " + specialtyColor + " text-white flex items-center justify-center shadow-md z-10"}>
                    <FaUserMd size={16} />
                </div>
                {!isLast && (
                    <div className="w-0.5 flex-1 bg-gradient-to-b from-primary-200 to-primary-100 min-h-[40px]" />
                )}
            </div>

            <div className="flex-1 pb-6 pl-4">
                <button
                    type="button"
                    className="w-full bg-white border border-primary-200 rounded-xl p-4 text-left hover:border-primary-400 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-200 group"
                    onClick={() => setExpanded(!expanded)}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2 mb-1">
                                <span className={"text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white " + specialtyColor}>
                                    {specialtyName}
                                </span>
                                {primaryDiagnosis && primaryDiagnosis.condition_status && (
                                    <span className={"text-[10px] font-semibold px-2 py-0.5 rounded-full border " + (CONDITION_COLORS[primaryDiagnosis.condition_status] || "bg-gray-100 text-gray-600 border-gray-200")}>
                                        {primaryDiagnosis.condition_status}
                                    </span>
                                )}
                            </div>

                            <h3 className="text-base font-bold text-primary-800 leading-tight group-hover:text-primary-600 transition-colors">
                                Dr. {consultation.doctor.user.name}
                            </h3>

                            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-primary-500">
                                <span className="flex items-center gap-1.5">
                                    <FaCalendarAlt size={11} className="text-primary-400" />
                                    {formatDate(consultation.date)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <FaChevronDown size={10} className="text-primary-400" />
                                    {formatTime(consultation.started_at)} &mdash; {formatTime(consultation.finished_at)}
                                </span>
                                {duration && (
                                    <span className="flex items-center gap-1.5 bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full font-semibold">
                                        {duration}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                            {consultation.prescriptions.length > 0 && (
                                <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-primary-500 text-white font-medium shadow-sm">
                                    <FaPills size={11} />
                                    {consultation.prescriptions.length} {consultation.prescriptions.length === 1 ? "receta" : "recetas"}
                                </span>
                            )}
                            <span className="text-primary-400 group-hover:text-primary-600 transition-transform duration-200">
                                {expanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                            </span>
                        </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-primary-100">
                        <div className="flex items-center gap-2 text-xs font-semibold text-primary-600 uppercase tracking-wide mb-2">
                            <FaStethoscope size={11} /> Diagnostico principal
                        </div>
                        {primaryDiagnosis ? (
                            <p className="text-sm font-medium text-primary-700 leading-snug">
                                {primaryDiagnosis.diagnosis.description}
                            </p>
                        ) : (
                            <p className="text-sm text-primary-400 italic">Sin diagnostico registrado</p>
                        )}
                    </div>
                </button>

                {expanded && (
                    <div className="mt-2 space-y-3 animate-in slide-in-from-top-2 fade-in duration-300">
                        {consultation.clinicalExaminations.length > 0 && (
                            <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">
                                    <FaHeartbeat size={11} /> Signos Vitales
                                </div>
                                <VitalsDisplay exam={consultation.clinicalExaminations[0]} />
                            </div>
                        )}

                        {consultation.symptomsConsultations.length > 0 && (
                            <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">
                                    <FaClipboardList size={11} /> Sintomas
                                </div>
                                <div className="space-y-2">
                                    {consultation.symptomsConsultations.map((s) => (
                                        <div key={s.id} className="flex items-start gap-2">
                                            <span className={"mt-1 w-1.5 h-1.5 rounded-full shrink-0 " + (SEVERITY_COLORS[s.severity] || "bg-gray-400")} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center flex-wrap gap-x-2">
                                                    <span className="text-sm font-medium text-primary-800">{s.symptom.name}</span>
                                                    <span className={"text-xs font-semibold " + (SEVERITY_COLORS[s.severity] || "text-gray-500")}>
                                                        {s.severity}
                                                    </span>
                                                    <span className="text-xs text-primary-400"> &middot; {s.duration}</span>
                                                </div>
                                                {s.notes && (
                                                    <p className="text-[11px] text-primary-400 mt-0.5 italic leading-relaxed">{s.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {consultation.consultationDiagnoses.length > 0 && (
                            <div className="bg-white border border-primary-200 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-2 text-xs font-semibold text-primary-700 uppercase tracking-wide mb-3">
                                    <FaStethoscope size={11} /> Todos los diagnosticos
                                </div>
                                <div className="space-y-3">
                                    {consultation.consultationDiagnoses.map((d) => (
                                        <DiagnosisBadge key={d.id} diagnosis={d} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {consultation.prescriptions.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-semibold text-primary-700 uppercase tracking-wide px-1">
                                    <FaPills size={11} /> Tratamiento / Recetas
                                </div>
                                {consultation.prescriptions.map((p) => (
                                    <PrescriptionCard key={p.id} prescription={p} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PatientHistory({ patientId }: PatientHistoryProps) {
    const { data: consultations, isLoading } = useSWR(
        ["patient-consultations", patientId],
        () => listConsultationsByPatient(patientId)
    );

    const totalConsultations = consultations ? consultations.length : 0;
    const lastDate = consultations && consultations.length > 0
        ? formatDate(consultations[0].date)
        : "--";
    const uniqueDoctorCount = consultations
        ? new Set(consultations.map((c) => c.doctor.id)).size
        : 0;

    const sortedConsultations = consultations
        ? [...consultations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        : [];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard
                    title="Total consultas"
                    value={totalConsultations}
                    subText="consultas registradas"
                    icon={<FaCalendarAlt size={18} />}
                    color="primary"
                    variant="compact"
                />
                <StatsCard
                    title="Ultima consulta"
                    value={lastDate}
                    subText="fecha de visita"
                    icon={<FaCalendarAlt size={18} />}
                    color="success"
                    variant="compact"
                />
                <StatsCard
                    title="Medicos visitados"
                    value={uniqueDoctorCount}
                    subText="doctores unicos"
                    icon={<FaUserMd size={18} />}
                    color="warning"
                    variant="compact"
                />
            </div>

            <section className="bg-gradient-to-b from-primary-50/50 to-white border border-primary-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-primary-100 bg-white">
                    <h2 className="text-lg font-bold text-primary-800 flex items-center gap-2">
                        <FaFileMedical className="text-primary-500" size={18} />
                        Historial de Consultas
                    </h2>
                    <p className="text-xs text-primary-500 mt-0.5">
                        {sortedConsultations.length > 0
                            ? sortedConsultations.length + " consultas &middot; click para ver detalles"
                            : "Sin consultas registradas aun"}
                    </p>
                </div>

                <div className="px-6 py-6">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 animate-pulse" />
                                        <div className="w-0.5 h-16 bg-primary-100 animate-pulse rounded" />
                                    </div>
                                    <div className="flex-1 h-24 bg-primary-50 rounded-xl animate-pulse" />
                                </div>
                            ))}
                        </div>
                    ) : sortedConsultations.length > 0 ? (
                        <div className="relative">
                            {sortedConsultations.map((c, i) => (
                                <TimelineNode
                                    key={c.id}
                                    consultation={c}
                                    isLast={i === sortedConsultations.length - 1}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 mb-4">
                                <FaCalendarAlt size={32} className="text-primary-300" />
                            </div>
                            <h3 className="text-base font-semibold text-primary-700 mb-1">Sin consultas clinicas registradas</h3>
                            <p className="text-sm text-primary-400 max-w-xs mx-auto">
                                Cuando el paciente tenga consultas medicas registradas, apareceran aqui en orden cronologico.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
