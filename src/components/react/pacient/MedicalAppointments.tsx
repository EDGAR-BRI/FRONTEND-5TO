import {
  FaCalendarDays,
  FaClock,
  FaLocationDot,
  FaFileLines,
  FaCircleCheck,
  FaCircleInfo,
} from 'react-icons/fa6';
import { ModalTrigger } from '../primary/ModalTrigger';
import { Button } from '../primary/Button';
import StaticCard from '../primary/StaticCard';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Spinner } from '@/components/react/primary/Spinner';

export const MedicalAppointments = ({ patientId }: { patientId: string }) => {
  const { data: appointmentsData, isLoading } = useSWR(`/scheduling/appointment/patient/${patientId}`, fetcher);

  if (isLoading) return (
    <StaticCard className="p-16 text-center flex flex-col items-center gap-4 border-dashed">
      <Spinner />
    </StaticCard>
  );

  const appointments = appointmentsData?.data || [];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-bold text-slate-800">Citas Programadas</h3>
      </div>
      
      {appointments.length > 0 ? (
        appointments.map((app: any, i: number) => (
          <AppointmentDetailModal key={i} appointment={app} />
        ))
      ) : (
        <StaticCard className="p-16 text-center flex flex-col items-center gap-4 border-dashed">
          <div className="bg-white p-6 rounded-full text-slate-300 shadow-sm">
            <FaCalendarDays className="w-14 h-14" />
          </div>
          <p className="text-slate-800 font-bold text-lg">No hay citas programadas</p>
        </StaticCard>
      )}
    </div>
  );
};

const AppointmentDetailModal = ({ appointment }: { appointment: any }) => {
  const specialty = appointment.doctor?.specialty?.name || 'General';
  const doctorName = appointment.doctor?.user?.name || 'No asignado';
  const statusName = appointment.status?.name || 'Programada';
  const isCompleted = statusName === 'Atendido' || statusName === 'Completada';
  
  const appointmentDate = new Date(appointment.date_time);
  const fecha = appointmentDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const hora = appointmentDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <StaticCard className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="bg-white p-4 rounded-2xl text-blue-600 shadow-sm border border-blue-50">
          <FaCalendarDays className="w-6 h-6" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-slate-800">{specialty}</p>
            
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              isCompleted 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {statusName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 italic">
            Dr(a): {doctorName}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-white px-3 py-2 rounded-lg shadow-sm">
          <FaClock className="w-3 h-3 text-blue-500" /> {hora}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-white px-3 py-2 rounded-lg shadow-sm">
          <FaCalendarDays className="w-3 h-3 text-red-400" /> {fecha}
        </div>
      </div>

      <ModalTrigger
        modalTitle="Detalles de la Cita"
        trigger={
          <button className="bg-white text-blue-600 text-xs font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-all shadow-sm border border-transparent">
            Ver Detalles
          </button>
        }
      >
        {({ close }) => (
          <div className="space-y-6">
            <div className={`flex items-center gap-4 p-6 rounded-2xl border ${isCompleted ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'}`}>
              <div className={`${isCompleted ? 'bg-emerald-500' : 'bg-blue-600'} p-3 rounded-xl shadow-lg shadow-emerald-500/20`}>
                <FaFileLines className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className={`${isCompleted ? 'text-emerald-600' : 'text-blue-600'} text-[10px] font-black uppercase tracking-widest`}>
                  {isCompleted ? 'Consulta Finalizada' : 'Cita Programada'}
                </p>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">{specialty}</h2>
              </div>
            </div>

            <div className="space-y-5 px-2 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Médico Especialista</label>
                  <p className="text-sm font-semibold text-slate-700">{doctorName}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Fecha Programada</label>
                  <p className="text-sm font-semibold text-slate-700">{fecha}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Hora</label>
                <p className="text-sm font-semibold text-slate-700">{hora}</p>
              </div>

              <div className={`p-4 rounded-2xl border flex gap-3 ${isCompleted ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                {isCompleted ? (
                  <FaCircleCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
                ) : (
                  <FaCircleInfo className="w-5 h-5 text-amber-600 mt-0.5" />
                )}
                <p className={`text-[11px] leading-tight font-medium ${isCompleted ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {isCompleted ? 'Esta consulta ya fue procesada y se encuentra en su historial.' : 'Recuerde llegar 15 minutos antes con su identificación vigente.'}
                </p>
              </div>
            </div>

            <Button label="Entendido" variant="primary" onClick={close} adaptive className="h-12 shadow-lg" />
          </div>
        )}
      </ModalTrigger>
    </StaticCard>
  );
};