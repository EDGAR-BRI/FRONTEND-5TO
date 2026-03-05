import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, CalendarDays, CheckCircle2 } from 'lucide-react';
import { AppointmentDetailModal } from './AppointmentDetailModal';

interface Appointment {
  doctor: string;
  especialidad: string;
  fecha: string;
  hora: string;
  lugar: string;
  status: 'asistio' | 'pendiente';
}

export const MedicalAppointments = () => {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const appointments: Appointment[] = [
    {
      doctor: "Dr. Alejandro Lira",
      especialidad: "Cardiología",
      fecha: "15 de Marzo, 2024",
      hora: "09:30 AM",
      lugar: "Consultorio 402 - Clínica VitalFe & Alegría",
      status: 'pendiente'
    },
    {
      doctor: "Dra. Elena Rossi",
      especialidad: "Medicina General",
      fecha: "10 de Febrero, 2024",
      hora: "11:00 AM",
      lugar: "Consultorio 105 - Clínica VitalFe & Alegría",
      status: 'asistio'
    }
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <h3 className="text-lg font-bold text-slate-800 px-2">Citas Programadas</h3>

      {appointments.length > 0 ? (
        appointments.map((cita, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-primary-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-primary-400">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-800">{cita.especialidad}</p>
                  {cita.status === 'asistio' ? (
                    <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3" /> Asistió
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold border border-blue-100">
                      <Clock className="w-3 h-3" /> Próxima
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <User className="w-3 h-3" /> {cita.doctor}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg font-medium">
                <Clock className="w-3 h-3 text-blue-400" /> {cita.hora}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg font-medium">
                <MapPin className="w-3 h-3 text-red-400" /> {cita.lugar}
              </div>
            </div>

            <button
              onClick={() => setSelectedAppointment(cita)}
              className="bg-blue-50 text-blue-600 text-xs font-bold px-8 py-3 rounded-xl hover:bg-blue-600 hover:text-white transition-all border border-blue-100/50"
            >
              Ver Detalles
            </button>
          </div>
        ))
      ) : (
        <div className="bg-white p-12 rounded-lg border border-primary-200 border-dashed text-center flex flex-col items-center gap-4 shadow-sm transition-all hover:border-primary-400">
          <div className="bg-slate-50 p-6 rounded-full text-slate-300">
            <CalendarDays className="w-12 h-12" />
          </div>
          <div className="max-w-xs">
            <p className="text-slate-800 font-bold text-lg">No tienes citas próximas</p>
            <p className="text-slate-400 text-xs mt-1">
              Aquí aparecerán las consultas médicas que programes en el futuro.
            </p>
          </div>
        </div>
      )}

      <AppointmentDetailModal
        isOpen={selectedAppointment !== null}
        onClose={() => setSelectedAppointment(null)}
        appointment={selectedAppointment}
      />
    </div>
  );
};