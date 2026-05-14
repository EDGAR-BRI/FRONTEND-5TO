import { useState, useEffect } from 'react';
import {
  FaCalendarDays,
  FaClock,
  FaFileLines,
  FaCircleCheck,
  FaCircleInfo,
} from 'react-icons/fa6';
import { ModalTrigger } from '../primary/ModalTrigger';
import { Button } from '../primary/Button';
import StaticCard from '../primary/StaticCard';
import { api } from '@/lib/api';
import { Spinner } from '@/components/react/primary/Spinner';

export const MedicalAppointments = ({ patientId }: { patientId: string }) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        // 1. Buscamos al paciente actual para saber cuál es su userId
        const currentPatientRes = await api(`/medical/patient/${patientId}`);
        if (!currentPatientRes.ok) throw new Error('Patient not found');
        const currentPatientJson = await currentPatientRes.json();
        const currentPatient = currentPatientJson.data;
        const linkedUserId = currentPatient.user?.id || currentPatient.userId;

        if (!linkedUserId) {
          setAppointments([]);
          return;
        }

        // 2. Buscamos TODOS los pacientes vinculados a ese userId (Grupo Familiar)
        const linkedPatientsRes = await api(`/medical/patient/user/${linkedUserId}`);
        const linkedPatientsJson = linkedPatientsRes.ok ? await linkedPatientsRes.json() : null;
        const linkedRaw = linkedPatientsJson?.data;
        const linkedPatients = Array.isArray(linkedRaw) ? linkedRaw : linkedRaw ? [linkedRaw] : [currentPatient];

        // 3. Traemos las citas de todos ellos
        const appointmentResponses = await Promise.all(
          linkedPatients.map((patient: any) => api(`/scheduling/appointment/patient/${patient.id}`))
        );

        const appointmentJsonList = await Promise.all(
          appointmentResponses
            .filter((res) => res.ok)
            .map((res) => res.json())
        );

        const allAppointments = appointmentJsonList.flatMap((item) =>
          Array.isArray(item?.data) ? item.data : []
        );

        // Opcional: Podrías ordenar las citas por fecha más reciente
        allAppointments.sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime());

        setAppointments(allAppointments);
      } catch (error) {
        console.error("Error fetching grouped appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [patientId]);

  if (isLoading) return (
    <StaticCard className="p-16 text-center flex flex-col items-center gap-4 border-dashed bg-white">
      <Spinner />
    </StaticCard>
  );

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
        <StaticCard className="p-16 text-center flex flex-col items-center gap-4 border-dashed bg-white">
          <div className="bg-slate-50 p-6 rounded-full text-slate-300 shadow-sm border border-slate-100">
            <FaCalendarDays className="w-14 h-14" />
          </div>
          <p className="text-slate-800 font-bold text-lg">No hay citas programadas</p>
        </StaticCard>
      )}
    </div>
  );
};

const AppointmentDetailModal = ({ appointment }: { appointment: any }) => {
  const specialty = appointment.doctor?.specialty?.name || 'Medicina General';
  const doctorName = appointment.doctor?.user?.name || 'No asignado';
  const statusName = appointment.status?.name || 'Programada';
  const isCompleted = statusName === 'Atendido' || statusName === 'Completada' || statusName === 'Finalizada';
  
  const appointmentDate = new Date(appointment.date_time);
  const fecha = appointmentDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const hora = appointmentDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  // Agregué el nombre del paciente para que se sepa de quién es la cita
  const patientName = appointment.patient?.name || appointment.patient?.user?.name || 'Paciente';

  return (
    <StaticCard className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white hover:border-blue-200 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-2xl shadow-sm border ${isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
          <FaCalendarDays className="w-6 h-6" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-slate-800">{specialty}</p>
            
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              isCompleted 
                ? 'bg-emerald-100 text-emerald-700' 
                : statusName === 'Pendiente' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {statusName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
            Dr(a). {doctorName}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Paciente: <span className="font-semibold text-slate-600">{patientName}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
          <FaClock className="w-3.5 h-3.5 text-slate-400" /> {hora}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
          <FaCalendarDays className="w-3.5 h-3.5 text-slate-400" /> {fecha}
        </div>
      </div>

      <ModalTrigger
        modalTitle="Detalles de la Cita"
        trigger={
          <button className="bg-slate-50 text-blue-600 text-xs font-bold px-6 py-3 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all border border-slate-200 shrink-0">
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Paciente</label>
                  <p className="text-sm font-semibold text-slate-700">{patientName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Fecha Programada</label>
                  <p className="text-sm font-semibold text-slate-700">{fecha}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Hora</label>
                  <p className="text-sm font-semibold text-slate-700">{hora}</p>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border flex gap-3 ${isCompleted ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                {isCompleted ? (
                  <FaCircleCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                ) : (
                  <FaCircleInfo className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                )}
                <p className={`text-[11px] leading-relaxed font-medium ${isCompleted ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {isCompleted ? 'Esta consulta ya fue procesada y se encuentra en el historial.' : 'Recuerde llegar 15 minutos antes con su identificación vigente y comprobante si aplica.'}
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