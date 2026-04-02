import {
  FaCalendarDays,
  FaClock,
  FaLocationDot,
  FaUserDoctor,
  FaFileLines,
} from 'react-icons/fa6';
import { ModalTrigger } from '../primary/ModalTrigger';
import { Button } from '../primary/Button';
import { Badge } from '../primary/Badge';
import StaticCard from '../primary/StaticCard';


export const MedicalAppointments = () => {
  const appointments = [
    { 
      especialidad: "Cardiología", 
      doctor: "Dr. Alejandro Lira", 
      fecha: "20 de Marzo, 2026",
      hora: "09:30 AM", 
      lugar: "Consultorio 402 - Clínica VitalFe & Alegría", 
      status: "pendiente" 
    },
    { 
      especialidad: "Medicina General", 
      doctor: "Dra. Elena Rossi", 
      fecha: "10 de Marzo, 2026",
      hora: "11:00 AM", 
      lugar: "Consultorio 105 - Clínica VitalFe & Alegría", 
      status: "asistio" 
    }
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <h3 className="text-lg font-bold text-slate-800 px-2">Citas Programadas</h3>
      {appointments.map((app, i) => (
        <AppointmentDetailModal key={i} appointment={app as any} />
      ))}
    </div>
  );
};


const AppointmentDetailModal = ({ appointment }: { appointment: any }) => {
  const isCompleted = appointment.status === 'asistio';

  return (
    <StaticCard className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="bg-white p-4 rounded-2xl text-blue-600 shadow-sm border border-blue-50">
          <FaCalendarDays className="w-6 h-6" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-slate-800">{appointment.especialidad}</p>
            <Badge 
              styles={{ 
                bg: isCompleted ? 'bg-emerald-50' : 'bg-blue-50',
                text: isCompleted ? 'text-emerald-600' : 'text-blue-600',
                border: isCompleted ? 'border-emerald-100' : 'border-blue-100'
              }}
            >
              {isCompleted ? 'Asistió' : 'Próxima'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <FaUserDoctor className="w-3 h-3" /> {appointment.doctor}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-white px-3 py-2 rounded-lg shadow-sm">
          <FaClock className="w-3 h-3 text-blue-500" /> {appointment.hora}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-white px-3 py-2 rounded-lg shadow-sm max-w-[200px] truncate">
          <FaLocationDot className="w-3 h-3 text-red-400" /> {appointment.lugar}
        </div>
      </div>

      <ModalTrigger
        modalTitle={isCompleted ? "Resumen de Cita" : "Detalles de Próxima Cita"}
        trigger={
          <Button 
            label="Ver Detalles" 
            variant="secondary" 
            className="px-8 py-3 h-auto text-xs font-bold shadow-none border border-primary-200" 
          />
        }
      >
        {({ close }) => (
          <div className="space-y-6">
            <div className={`flex items-center gap-4 p-6 rounded-2xl border ${isCompleted ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'}`}>
              <div className={`${isCompleted ? 'bg-emerald-500' : 'bg-blue-600'} p-3 rounded-xl shadow-lg`}>
                <FaFileLines className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className={`${isCompleted ? 'text-emerald-600' : 'text-blue-600'} text-[10px] font-black uppercase tracking-widest`}>
                  {isCompleted ? 'Consulta Finalizada' : 'Cita Programada'}
                </p>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">{appointment.especialidad}</h2>
              </div>
            </div>

            <div className="space-y-4">
              <StaticCard className="p-4 bg-white border-slate-100 shadow-none text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Médico Especialista</label>
                <p className="text-sm font-bold text-slate-700">{appointment.doctor}</p>
              </StaticCard>

              <div className="grid grid-cols-2 gap-4 text-left">
                <StaticCard className="p-4 bg-white border-slate-100 shadow-none text-xs text-slate-600">
                   <b>Fecha:</b> {appointment.fecha}
                </StaticCard>
                <StaticCard className="p-4 bg-white border-slate-100 shadow-none text-xs text-slate-600">
                   <b>Hora:</b> {appointment.hora}
                </StaticCard>
              </div>
            </div>

            <Button label="Entendido" variant="primary" onClick={close} adaptive className="h-12 shadow-lg" />
          </div>
        )}
      </ModalTrigger>
    </StaticCard>
  );
};