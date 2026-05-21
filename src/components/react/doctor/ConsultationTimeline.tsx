import { useMemo, useState } from "react";
import {
    FaCalendarDays,
    FaChevronDown,
    FaChevronUp,
    FaClipboardList,
    FaFileLines,
    FaPills,
    FaStethoscope,
} from "react-icons/fa6";
import type { PatientConsultationHistory } from "@/lib/services/medical/consultation/consultation.interface";

interface Props {
    consultations: PatientConsultationHistory[];
    doctorId: string | number;
}

const STATUS_STYLES: Record<PatientConsultationHistory["status"], { label: string; className: string; dot: string }> = {
    FINISHED: {
        label: "COMPLETADA",
        className: "bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
    },
    PENDING: {
        label: "PENDIENTE",
        className: "bg-blue-50 text-blue-700",
        dot: "bg-blue-500",
    },
    IN_PROGRESS: {
        label: "EN PROCESO",
        className: "bg-blue-50 text-blue-700",
        dot: "bg-blue-500",
    },
    CANCELLED: {
        label: "CANCELADA",
        className: "bg-rose-50 text-rose-700",
        dot: "bg-slate-400",
    },
};

function formatDate(value: string | null | undefined) {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("es-VE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatVitals(exam?: PatientConsultationHistory["clinicalExaminations"][number]) {
    if (!exam) return [];
    const items = [
        exam.temperature ? `Temp ${exam.temperature}` : null,
        exam.systolic_bp && exam.diastolic_bp ? `PA ${exam.systolic_bp}/${exam.diastolic_bp}` : null,
        exam.heart_rate ? `FC ${exam.heart_rate}` : null,
        exam.respiratory_rate ? `FR ${exam.respiratory_rate}` : null,
        exam.oxygen_saturation ? `SpO2 ${exam.oxygen_saturation}` : null,
        exam.weight ? `Peso ${exam.weight}` : null,
        exam.height ? `Altura ${exam.height}` : null,
    ];
    return items.filter(Boolean) as string[];
}

export function ConsultationTimeline({ consultations, doctorId }: Props) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const sorted = useMemo(() => {
        return [...consultations].sort((a, b) => {
            const dateA = new Date(a.started_at ?? a.date).getTime();
            const dateB = new Date(b.started_at ?? b.date).getTime();
            return dateB - dateA;
        });
    }, [consultations]);

    if (sorted.length === 0) {
        return (
            <div className="py-10 text-center text-sm text-slate-500">
                Sin consultas registradas.
            </div>
        );
    }

    return (
        <div className="relative space-y-6">
            {sorted.map((consultation, index) => {
                const status = STATUS_STYLES[consultation.status];
                const dateLabel = formatDate(consultation.started_at ?? consultation.date);
                const mainDiagnosis = consultation.consultationDiagnoses.find((d) => d.is_primary)
                    ?? consultation.consultationDiagnoses[0];
                const doctorName = consultation.doctor?.user?.name ?? "Doctor";
                const symptoms = consultation.symptomsConsultations;
                const clinicalExam = consultation.clinicalExaminations[0];
                const vitals = formatVitals(clinicalExam);
                const prescriptions = consultation.prescriptions;
                const isExpanded = expandedId === consultation.id;

                return (
                    <div key={consultation.id} className="relative flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${status.dot}`} />
                            {index < sorted.length - 1 && (
                                <div className="w-0.5 flex-1 bg-slate-200" />
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="bg-white rounded-xl border border-slate-200 p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            <FaCalendarDays size={12} /> {dateLabel}
                                        </p>
                                        <h4 className="text-sm font-bold text-slate-800 mt-1">
                                            {doctorName}
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {mainDiagnosis?.diagnosis?.description ?? "Sin diagnostico"}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${status.className}`}>
                                            {status.label}
                                        </span>
                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : consultation.id)}
                                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                        >
                                            Ver mas {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                                        </button>
                                    </div>
                                </div>

                                <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-96 mt-4" : "max-h-0"}`}>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                <FaFileLines size={11} /> Sintomas
                                            </p>
                                            {symptoms.length === 0 ? (
                                                <p className="text-xs text-slate-500 mt-2">Sin registros</p>
                                            ) : (
                                                <ul className="mt-2 text-xs text-slate-600 space-y-1">
                                                    {symptoms.map((s) => (
                                                        <li key={s.id}>
                                                            {s.symptom?.name ?? "Sintoma"}
                                                            {s.severity ? ` (${s.severity})` : ""}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                <FaStethoscope size={11} /> Examen clinico
                                            </p>
                                            {vitals.length === 0 ? (
                                                <p className="text-xs text-slate-500 mt-2">Sin registros</p>
                                            ) : (
                                                <ul className="mt-2 text-xs text-slate-600 space-y-1">
                                                    {vitals.map((vital) => (
                                                        <li key={vital}>{vital}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                <FaPills size={11} /> Prescripciones
                                            </p>
                                            {prescriptions.length === 0 ? (
                                                <p className="text-xs text-slate-500 mt-2">Sin registros</p>
                                            ) : (
                                                <ul className="mt-2 text-xs text-slate-600 space-y-1">
                                                    {prescriptions.map((p) => (
                                                        <li key={p.id}>
                                                            {p.medication_name ?? "Medicamento"}
                                                            {p.dosage ? ` ${p.dosage}` : ""}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                onClick={() => {
                                                    window.location.replace(
                                                        `/modules/doctor/${doctorId}/consultation/${consultation.id}`
                                                    );
                                                }}
                                                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#1e3a8a] bg-[#e0f2fe] rounded-lg hover:bg-[#bae6fd] transition-colors"
                                            >
                                                <FaClipboardList size={12} /> Abrir consulta
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
