import { useEffect, useMemo, useState } from 'react';
import StaticCard from '@/components/react/primary/StaticCard';
import { Spinner } from '@/components/react/primary/Spinner';
import RegisterPatientForm from '@/components/react/RegisterPatientForm';
import { api } from '@/lib/api';
import { getPatientsFromUser } from '@/lib/services/medical/patient/patient.service';
import type { Patient } from '@/lib/services/medical/patient/patient.interface';
import {
  FaArrowLeft,
  FaIdCard,
  FaUsers,
  FaUserPen,
  FaUserShield,
  FaCircleCheck,
} from 'react-icons/fa6';

type Props = {
  patientId: string;
};

export const FamilyGroupManager = ({ patientId }: Props) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [familyMembers, setFamilyMembers] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const loadFamily = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api(`/medical/patient/${patientId}`);
      if (!response.ok) {
        throw new Error('No se pudo cargar el paciente principal');
      }

      const json = await response.json();
      const mainPatient = json.data as Patient;
      setPatient(mainPatient);

      const userId = mainPatient?.user?.id || mainPatient?.userId;
      if (!userId) {
        setFamilyMembers(mainPatient ? [mainPatient] : []);
        return;
      }

      const linkedPatients = await getPatientsFromUser(userId);
      setFamilyMembers(Array.isArray(linkedPatients) ? linkedPatients : []);
    } catch (err: any) {
      console.error('Error cargando grupo familiar:', err);
      setError(err?.message || 'No se pudo cargar el grupo familiar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFamily();
  }, [patientId, reloadToken]);

  const ownerUserId = patient?.user?.id || patient?.userId || null;

  const stats = useMemo(() => {
    const total = familyMembers.length;
    const active = familyMembers.filter(member => member.active !== false).length;
    const linked = ownerUserId ? 1 : 0;

    return [
      { label: 'Miembros del grupo', value: total, icon: FaUsers, color: 'text-primary-600' },
      { label: 'Activos', value: active, icon: FaCircleCheck, color: 'text-emerald-600' },
      { label: 'Usuario base', value: linked, icon: FaUserShield, color: 'text-sky-600' },
    ];
  }, [familyMembers, ownerUserId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner className="h-10 w-10 text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-cool-gray-50 mb-2">
            <a href="overview" className="inline-flex items-center gap-1 hover:text-primary-600 transition-colors">
              <FaArrowLeft /> Volver al dashboard
            </a>
            <span>/</span>
            <span>Grupo familiar</span>
          </div>
          <h1 className="text-heading-4 text-primary-800">Gestión del grupo familiar</h1>
          <p className="text-body-s text-cool-gray-50 mt-1 max-w-3xl">
            Agrega nuevos pacientes vinculados al mismo usuario principal y accede a su edición individual cuando lo necesites.
          </p>
        </div>

        <div className="inline-flex items-center gap-3 rounded-2xl border border-primary-200 bg-white px-4 py-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
            <FaIdCard />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-cool-gray-50 font-semibold">Usuario principal</p>
            <p className="text-sm font-bold text-primary-800">{patient?.user?.name || patient?.name || 'Sin usuario vinculado'}</p>
          </div>
        </div>
      </div>

      {error && (
        <StaticCard className="p-4 border border-red-200 bg-red-50 text-red-700">
          {error}
        </StaticCard>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <StaticCard key={label} className="p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-cool-gray-50 font-semibold">{label}</p>
              <p className="text-3xl font-bold text-primary-800 mt-1">{value}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
              <Icon className={`text-xl ${color}`} />
            </div>
          </StaticCard>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-heading-6 text-primary-800">Miembros vinculados</h2>
              <p className="text-body-xs text-cool-gray-50 mt-1">Cada paciente comparte el mismo usuario base del grupo.</p>
            </div>
          </div>

          {familyMembers.length === 0 ? (
            <StaticCard className="p-6 text-center text-cool-gray-50">
              No hay pacientes vinculados todavía.
            </StaticCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {familyMembers.map(member => {
                const isMain = member.id === Number(patientId);
                return (
                  <StaticCard key={member.id} className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-primary-800">{member.name || member.user?.name || 'Paciente'}</h3>
                          {isMain && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 text-primary-700 text-[11px] font-semibold px-2.5 py-1">
                              Principal
                            </span>
                          )}
                          {member.active !== false && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2.5 py-1">
                              Activo
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-cool-gray-50 mt-1">CI: {member.ci || member.user?.ci || 'Sin CI'}</p>
                        <p className="text-xs text-cool-gray-50 mt-1">Usuario vinculado: {member.user?.name || 'No disponible'}</p>
                      </div>

                      <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                        <FaUsers />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-primary-100">
                      <a
                        href={`/modules/pacient/${member.id}/profile`}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
                      >
                        <FaUserPen /> Editar datos
                      </a>
                      <a
                        href={`/modules/pacient/${member.id}/history`}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-primary-200 text-primary-700 text-sm font-semibold hover:bg-primary-50 transition-colors"
                      >
                        Ver historial
                      </a>
                    </div>
                  </StaticCard>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-heading-6 text-primary-800">Agregar nuevo miembro</h2>
            <p className="text-body-xs text-cool-gray-50 mt-1">El paciente quedará enlazado al usuario principal del grupo familiar.</p>
          </div>

          {ownerUserId ? (
            <div className="rounded-3xl border border-primary-200 bg-primary-50/40 p-4 shadow-sm">
              <RegisterPatientForm
                familyMode
                linkedUserId={ownerUserId}
                createInfoPatientOnRegister={false}
                title="Nuevo miembro familiar"
                subtitle="Registra un paciente adicional y lo enlaza al mismo usuario base."
                onSuccess={() => setReloadToken(token => token + 1)}
              />
            </div>
          ) : (
            <StaticCard className="p-6 text-sm text-cool-gray-50">
              No se pudo determinar el usuario principal para este paciente.
            </StaticCard>
          )}
        </div>
      </div>
    </div>
  );
};
