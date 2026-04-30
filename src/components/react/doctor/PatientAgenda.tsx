import { useEffect, useMemo, useState } from "react";
import {
  FaCalendarDays,
  FaChevronRight,
  FaFileLines,
  FaFilter,
  FaMagnifyingGlass,
  FaRegClock,
  FaStethoscope,
  FaUser,
} from "react-icons/fa6";
import ActionCard from "../primary/ActionCard";
import { Modal } from "../primary/Modal";
import { listConsultationsByDoctor } from "@/lib/services/medical/consultation/consultation.service";
import type { ConsultationSummary } from "@/lib/services/medical/consultation/consultation.interface";
type AppointmentRow = {
  id: number;
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

function mapConsultationToRow(c: ConsultationSummary): AppointmentRow {
  const finished = Boolean(c.finished_at);
  const status = finished ? "COMPLETADA" : "PENDIENTE";
  const statusColor = finished ? "text-emerald-600 bg-emerald-50" : "text-blue-600 bg-blue-50";

  const dateSource = c.started_at ?? c.date;
  const { date, time } = formatDateParts(dateSource);

  const patientName = c.invoice?.patient?.user?.name ?? c.invoice?.patient?.name ?? "Paciente";
  const doctorName = c.doctor?.user?.name ?? "Doctor";

  const totalUsd = c.invoice?.total_usd ? String(c.invoice.total_usd) : "-";
  const notes = `Factura #${c.invoice?.id ?? "-"} • Total $${totalUsd}`;

  return {
    id: c.id,
    patient: patientName,
    date,
    time,
    reason: `Consulta #${c.id}`,
    status,
    statusColor,
    notes,
    doctor: doctorName,
  };
}

export default function PatientAgenda({ doctorId }: { doctorId: string | number }) {
  const [search, setSearch] = useState("");
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedAppt, setSelectedAppt] = useState<AppointmentRow | null>(null);

  useEffect(() => {
    const doctorIdNum = Number(doctorId);
    if (!Number.isFinite(doctorIdNum) || doctorIdNum <= 0) {
      setLoadError("doctorId inválido");
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    listConsultationsByDoctor(doctorIdNum)
      .then((data) => {
        if (cancelled) return;
        setAppointments(data.map(mapConsultationToRow));
      })
      .catch((e) => {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : "Error cargando consultas");
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  const filteredAppointments = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return appointments;
    return appointments.filter((a) => {
      return a.patient.toLowerCase().includes(q) || a.reason.toLowerCase().includes(q);
    });
  }, [appointments, search]);

  return (
    <div className="flex flex-col gap-6">

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96">
			<FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por paciente o motivo..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
			<FaFilter size={16} /> Filtros
          </button>
          <button className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold text-white bg-[#1e3a8a] rounded-lg hover:bg-blue-800 transition-colors shadow-sm">
            + Nueva Cita
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-[#1e293b] text-base flex items-center gap-2 uppercase tracking-wide">
			<FaCalendarDays size={20} className="text-[#1e3a8a]" /> Agenda de Consultas
          </h2>
        </div>

        <div className="space-y-4">
        {isLoading ? (
        <div className="text-sm text-slate-500">Cargando consultas...</div>
        ) : loadError ? (
        <div className="text-sm text-rose-600">{loadError}</div>
        ) : filteredAppointments.length === 0 ? (
        <div className="text-sm text-slate-500">No hay consultas para mostrar.</div>
        ) : filteredAppointments.map((a) => (
            <ActionCard 
          key={a.id} 
              className="flex-wrap! gap-y-3 cursor-pointer border border-slate-200 hover:border-[#1e3a8a]/30 hover:shadow-md transition-all p-4!"
              onClick={() => setSelectedAppt(a)}
            >
              <div className="flex flex-1 items-center gap-5 min-w-0 w-full sm:w-auto">
                <div className="w-12 h-12 shrink-0 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors">
					<FaUser size={22} />
                </div>

                <div className="min-w-0 flex flex-col gap-1.5">
                  <h4 className="font-black text-[#1e293b] text-[15px] truncate">{a.patient}</h4>
                  <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
					<FaRegClock size={14} className="text-[#3b82f6]" /> {a.time}
                    <span className="text-slate-300">•</span>
                    <span className="italic truncate">{a.reason}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                    {a.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 ml-auto">
                <span className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${a.statusColor}`}>
                  {a.status}
                </span>
				<FaChevronRight size={18} className="text-slate-300 group-hover:text-[#1e3a8a] transition-colors" />
              </div>
            </ActionCard>
    		  ))}
        </div>
      </div>
      <Modal
        isOpen={!!selectedAppt}
        onClose={() => setSelectedAppt(null)}
        title="Detalle de la Consulta"
      >
        {selectedAppt && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            <div className="flex items-center gap-4">
              <div className="text-[#1e3a8a] shrink-0 p-2">
				<FaUser size={28} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Paciente</p>
                <h4 className="text-xl font-black text-[#1e293b] leading-tight mb-2 truncate">{selectedAppt.patient}</h4>
                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${selectedAppt.statusColor}`}>
                  {selectedAppt.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white">
                <div className="w-12 h-12 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0">
					<FaCalendarDays size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Fecha y Hora</p>
                  <p className="text-base font-black text-[#1e293b] leading-tight">{selectedAppt.date}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">{selectedAppt.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white">
                <div className="w-12 h-12 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0">
					<FaStethoscope size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Médico</p>
                  <p className="text-base font-black text-[#1e293b] leading-tight">{selectedAppt.doctor}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#f8fafc] p-5 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
				<FaFileLines size={12}/> Motivo de Consulta
              </p>
              <p className="text-sm font-bold text-[#1e293b] mb-5">{selectedAppt.reason}</p>
              
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Notas Previas</p>
              <p className="text-[13px] text-slate-600 leading-relaxed italic">
                "{selectedAppt.notes}"
              </p>
            </div>

            <div className="pt-2 flex justify-end">

              <button 
                onClick={() => setSelectedAppt(null)} 
                className="px-6 py-2 text-sm font-bold text-[#1e3a8a] bg-white border-2 border-[#1e3a8a] rounded-lg hover:bg-blue-50 transition-colors"
              >
                Cerrar
              </button>
            </div>
            
          </div>
        )}
      </Modal>
    </div>
  );
}