import { useEffect, useMemo, useState } from "react";
import {
  FaCalendarDays,
  FaChevronRight,
  FaRegClock,
  FaStethoscope,
  FaUser,
  FaFileLines,
} from "react-icons/fa6";
import ActionCard from "../primary/ActionCard";
import { Modal } from "../primary/Modal";
import { Button } from "../primary/Button";
import { StatsCard } from "../primary/StatsCard";
import { listConsultationsByDoctor } from "@/lib/services/medical/consultation/consultation.service";
import type { ConsultationSummary } from "@/lib/services/medical/consultation/consultation.interface";

type AppointmentRow = {
  patient: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  statusColor: string;
  notes: string;
  doctor: string;
};

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

function mapConsultationToAppointment(c: ConsultationSummary): AppointmentRow {
  const finished = Boolean(c.finished_at);
  const status = finished ? "Completada" : "Pendiente";
  const statusColor = finished ? "text-emerald-500 bg-emerald-50" : "text-amber-500 bg-amber-50";

  const dateSource = c.started_at ?? c.date;
  const { date, time } = formatDateParts(dateSource);

  const patientName = c.invoice?.patient?.user?.name ?? c.invoice?.patient?.name ?? "Paciente";
  const doctorName = c.doctor?.user?.name ?? "Doctor";

  return {
    patient: patientName,
    date,
    time,
    reason: `Consulta #${c.id}`,
    status,
    statusColor,
    notes: `Factura #${c.invoice?.id ?? "-"}`,
    doctor: doctorName,
  };
}

function getLocalDateKey(dateValue: Date) {
  return `${dateValue.getFullYear()}-${String(dateValue.getMonth() + 1).padStart(2, "0")}-${String(dateValue.getDate()).padStart(2, "0")}`;
}

function isUpcomingPending(consultation: ConsultationSummary, now: Date) {
  if (consultation.status !== "PENDING") return false;
  const dateSource = consultation.started_at ?? consultation.date;
  const d = new Date(dateSource);
  if (Number.isNaN(d.getTime())) return false;
  const todayKey = getLocalDateKey(now);
  const dateKey = getLocalDateKey(d);
  return dateKey >= todayKey;
}

function sortByDateAsc(a: ConsultationSummary, b: ConsultationSummary) {
  const dateA = new Date(a.started_at ?? a.date).getTime();
  const dateB = new Date(b.started_at ?? b.date).getTime();
  return dateA - dateB;
}

export default function UpcomingAppointments({
  appointments: propAppointments,
  doctorId,
}: {
  appointments?: ConsultationSummary[];
  doctorId?: number | string;
}) {
  const [data, setData] = useState<ConsultationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedAppt, setSelectedAppt] = useState<AppointmentRow | null>(null);

  useEffect(() => {
    if (propAppointments) return;
    const doctorIdNum = Number(doctorId);
    if (!Number.isFinite(doctorIdNum) || doctorIdNum <= 0) return;

    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    listConsultationsByDoctor(doctorIdNum, { status: "PENDING" })
      .then((items) => {
        if (cancelled) return;
        setData(items);
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(error instanceof Error ? error.message : "Error cargando consultas");
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [doctorId, propAppointments]);

  const appointments = useMemo(() => {
    const source = propAppointments ?? data;
    const now = new Date();
    return source
      .filter((consultation) => isUpcomingPending(consultation, now))
      .sort(sortByDateAsc)
      .slice(0, 3)
      .map(mapConsultationToAppointment);
  }, [data, propAppointments]);

  return (
    <div className="p-6 relative h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2 uppercase tracking-wide">
			<FaCalendarDays size={18} className="text-[#1e3a8a]" /> Próximas Consultas a realizar
        </h3>
        <button className="text-[10px] font-black text-blue-600 uppercase tracking-tighter hover:underline">
          Ver Agenda Completa
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-sm text-slate-500">Cargando consultas...</div>
        ) : loadError ? (
          <div className="text-sm text-rose-600">{loadError}</div>
        ) : appointments.length === 0 ? (
          <div className="text-sm text-slate-500">No hay consultas pendientes próximas.</div>
        ) : appointments.map((a, i) => (
          <ActionCard 
            key={i} 
            className="!flex-wrap gap-y-3 cursor-pointer hover:border-blue-200"
            onClick={() => setSelectedAppt(a)}
          >
            <div className="flex flex-1 items-center gap-4 min-w-0 w-full sm:w-auto">
              <div className="w-12 h-12 shrink-0 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors">
				<FaUser size={20} />
              </div>

              <div className="min-w-0">
                <h4 className="font-bold text-slate-800 text-sm truncate">{a.patient}</h4>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
					<FaRegClock size={12} className="text-blue-500" /> {a.time}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-slate-500 font-medium italic truncate">
                    {a.reason}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-tighter">
                  {a.date}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 ml-auto">
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${a.statusColor}`}>
                {a.status}
              </span>
				<FaChevronRight size={16} className="text-slate-300 group-hover:text-[#1e3a8a] transition-colors" />
            </div>
          </ActionCard>
        ))}
      </div>
      {/* MODAL*/}
      <Modal
        isOpen={!!selectedAppt}
        onClose={() => setSelectedAppt(null)}
        title="Detalle de la Consulta"
      >
        {selectedAppt && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 shrink-0">
				<FaUser size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Paciente</p>
                <h4 className="text-xl font-black text-slate-800 leading-tight mb-1 truncate">{selectedAppt.patient}</h4>
                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${selectedAppt.statusColor}`}>
                  {selectedAppt.status}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatsCard
                variant="compact"
                title="FECHA Y HORA"
                value={selectedAppt.date}
                subText={selectedAppt.time}
                subTextClass="text-slate-500 font-medium"
				icon={<FaCalendarDays size={20} />}
                color="primary"
              />
              <StatsCard
                variant="compact"
                title="MÉDICO"
                value={selectedAppt.doctor}
				icon={<FaStethoscope size={20} />}
                color="primary"
              />
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
				<FaFileLines size={12}/> Motivo de Consulta
              </p>
              <p className="text-sm font-bold text-slate-800 mb-4">{selectedAppt.reason}</p>
              
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Notas Previas</p>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "{selectedAppt.notes}"
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <Button 
                label="Cerrar" 
                variant="secondary" 
                onClick={() => setSelectedAppt(null)} 
              />
            </div>
            
          </div>
        )}
      </Modal>
    </div>
  );
}
