import { useState, useEffect } from 'react';
import { ContactInfo } from './ContactInfo';
import { EmergencyContact } from './EmergencyContact';
import { MedicalAppointments } from './MedicalAppointments';
import { CurrentMedication } from './CurrentMedication';
import { PaymentsBills } from './PaymentsBills';
import StaticCard from '@/components/react/primary/StaticCard'; 
import { ModalTrigger } from '@/components/react/primary/ModalTrigger';
import { Button } from '../primary/Button';
import useSWR, { mutate } from 'swr'; // Importamos mutate para actualizar la UI en vivo
import { fetcher } from '@/lib/fetcher';
import { api } from '@/lib/api'; // Tu helper de peticiones

import {
  FaCircleUser,
  FaCalendarDays,
  FaPills,
  FaReceipt,
  FaGears,
  FaEnvelope,
  FaPhone,
  FaLocationDot,
  FaUser,
  FaShieldHalved,
  FaDroplet,
  FaNotesMedical,
  FaVenusMars,
  FaCalendarWeek,
  FaMapLocationDot,
  FaBriefcaseMedical
} from 'react-icons/fa6';

type ProfileTabsProps = {
  patientId: string;
  initialData?: any;
};

export const ProfileTabs = ({ patientId, initialData }: ProfileTabsProps) => {
  const [activeTab, setActiveTab] = useState('personal');
  
  // 1. Traemos los datos actuales para rellenar el formulario inicial
  const { data: patientData } = useSWR(`/medical/info-patient/patient/${patientId}`, fetcher);

  // 2. Estados del formulario (Solo para los datos que acepta tu BD)
  const [bloodType, setBloodType] = useState('');
  const [chronicDiseases, setChronicDiseases] = useState('');
  const [allergies, setAllergies] = useState('');
  const [email, setEmail] = useState('');
  const [mainPhone, setMainPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (patientData?.data) {
      setBloodType(patientData.data.blood_type || '');
      setChronicDiseases(patientData.data.chronic_diseases || '');
      setAllergies(patientData.data.allergies || '');
      setEmail(patientData.data.email || '');
      setMainPhone(patientData.data.main_phone || '');
      setAddress(patientData.data.address || '');
    }
  }, [info]);

  const tabs = [
    { id: 'personal', label: 'Inf. Personal', icon: FaCircleUser },
    { id: 'citas', label: 'Citas Médicas', icon: FaCalendarDays },
    { id: 'tratamientos', label: 'Tratamientos', icon: FaPills },
    { id: 'pagos', label: 'Facturación', icon: FaReceipt },
  ];

  // 3. Función que dispara el PUT
  const handleSaveChanges = async (e: React.FormEvent, close: () => void) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await api(`/medical/info-patient/patient/${patientId}`, {
        method: 'PUT',
        body: JSON.stringify({
          blood_type: bloodType,
          chronic_diseases: chronicDiseases,
          allergies: allergies,
          email: email,
          main_phone: mainPhone,
          address: address
        })
      });

      if (response.ok) {
        // Magia de SWR: Le decimos que vuelva a cargar los datos en toda la pantalla
        mutate(`/medical/info-patient/patient/${patientId}`);
        alert("¡Perfil actualizado con éxito!");
        close();
      } else {
        alert("Hubo un error al actualizar el perfil.");
      }
    } catch (error) {
      console.error("Error actualizando perfil:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="relative flex h-full w-full flex-col gap-6">

      <nav 
        className="flex w-full flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-[0_12px_40px_rgba(15,23,42,0.06)]"
        aria-label="Menú de perfil"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              label="" 
              className={`flex min-w-32.5 flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition-all ${
                isActive 
                  ? 'bg-sky-600! text-white! shadow-lg shadow-sky-200 border-transparent' 
                  : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
              }`}
            >
              <Icon className={`size-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className={isActive ? 'text-white' : 'text-slate-600'}>
                {tab.label}
              </span>
            </Button>
          );
        })}
      </nav>

      {/* CONTENIDO DE LAS PESTAÑAS */}
      <section className="w-full flex-1">
        <article className="h-full w-full">
          {activeTab === 'personal' && (
            <div className="flex w-full flex-col gap-6 animate-in fade-in duration-500">
              
              <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                <div className="w-full transition-all duration-300">
                  <ContactInfo patientId={patientId} initialData={info} />
                </div>
                <div className="w-full transition-all duration-300">
                  <EmergencyContact patientId={patientId} initialData={info} />
                </div>
              </div>

              <div className="w-full pt-2">
                <ModalTrigger
                  modalTitle="Gestionar Perfil"
                  trigger={
                    <Button
                      label=""
                      className="flex w-full items-center justify-center gap-3 rounded-2xl border-none bg-sky-600 py-5 text-base font-bold text-white shadow-lg shadow-sky-200 transition-all hover:bg-sky-700"
                    >
                      <FaGears className="w-5 h-5" />
                      Gestionar y Editar Perfil Completo
                    </Button>
                  }
                >
                  {({ close }) => (
                    <form className="space-y-6 p-2" onSubmit={(e) => handleSaveChanges(e, close)}>
                      
                      <StaticCard className="rounded-3xl border border-slate-200 bg-white p-6">
                        <div className="mb-6 flex items-center gap-2 border-b border-slate-200 pb-3">
                          <FaNotesMedical className="h-4 w-4 text-sky-600" />
                          <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">Información Médica</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-5">
                          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase italic">Sexo</label>
                              <div className="relative">
                                <select 
                                  value={sex}
                                  onChange={(e) => setSex(e.target.value)}
                                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none ring-sky-500 focus:ring-2"
                                >
                                  <option value="MALE">Masculino</option>
                                  <option value="FEMALE">Femenino</option>
                                </select>
                                <FaVenusMars className="absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase italic">Fecha de nacimiento</label>
                              <div className="relative">
                                <input 
                                  type="date" 
                                  value={birthDate}
                                  onChange={(e) => setBirthDate(e.target.value)}
                                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none ring-sky-500 focus:ring-2" 
                                />
                                <FaCalendarWeek className="absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase italic">Tipo de Sangre</label>
                            <div className="relative">
                              <input 
                                type="text" 
                                value={bloodType}
                                onChange={(e) => setBloodType(e.target.value)}
                                placeholder="Ej: O+, A-, AB+" 
                                maxLength={10}
                                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none ring-sky-500 focus:ring-2" 
                              />
                              <FaDroplet className="w-4 h-4 absolute right-3 top-3.5 text-red-400" />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase italic">Nacionalidad</label>
                              <input 
                                type="text" 
                                value={nationality}
                                onChange={(e) => setNationality(e.target.value)}
                                placeholder="Ej: Venezolana"
                                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none ring-sky-500 focus:ring-2" 
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase italic">Profesión</label>
                              <div className="relative">
                                <input 
                                  type="text" 
                                  value={profession}
                                  onChange={(e) => setProfession(e.target.value)}
                                  placeholder="Ej: Ingeniero"
                                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none ring-sky-500 focus:ring-2" 
                                />
                                <FaBriefcaseMedical className="absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase italic">Enfermedades Crónicas</label>
                            <textarea 
                              rows={3}
                              value={chronicDiseases}
                              onChange={(e) => setChronicDiseases(e.target.value)}
                              placeholder="Escriba aquí condiciones preexistentes..."
                              className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 ring-primary-500 resize-none" 
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase italic">Alergias</label>
                            <textarea 
                              rows={2}
                              value={allergies}
                              onChange={(e) => setAllergies(e.target.value)}
                              placeholder="Escriba aquí alergias relevantes..."
                              className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 ring-primary-500 resize-none" 
                            />
                          </div>
                        </div>
                      </StaticCard>

                      {/* DATOS DE CONTACTO */}
                      <StaticCard className="p-6">
                        <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-3">
                          <div className="flex items-center gap-2">
                            <FaPhone className="w-4 h-4 text-slate-500" />
                            <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest">Información de Contacto</h4>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase italic">Correo Electrónico</label>
                            <div className="relative">
                              <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="correo@ejemplo.com"
                                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 ring-primary-500" 
                              />
                              <FaEnvelope className="w-4 h-4 absolute right-3 top-3.5 text-slate-400" />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase italic">Teléfono Móvil</label>
                            <div className="relative">
                              <input 
                                type="text" 
                                value={mainPhone}
                                onChange={(e) => setMainPhone(e.target.value)}
                                placeholder="+58 412-1234567"
                                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 ring-primary-500" 
                              />
                              <FaPhone className="w-4 h-4 absolute right-3 top-3.5 text-slate-400" />
                            </div>
                          </div>
                          <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase italic">Dirección</label>
                            <div className="relative">
                              <input 
                                type="text" 
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Dirección completa"
                                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 ring-primary-500" 
                              />
                              <FaLocationDot className="w-4 h-4 absolute right-3 top-3.5 text-slate-400" />
                            </div>
                          </div>
                        </div>
                      </StaticCard>

                      <footer className="mt-8 flex gap-4">
                        <button
                          type="button"
                          onClick={close}
                          className="flex-1 rounded-2xl border border-slate-200 py-4 font-bold text-slate-500 transition-all hover:bg-slate-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className={`flex-1 rounded-2xl py-4 font-bold text-white shadow-lg transition-all ${
                            isSaving ? 'cursor-not-allowed bg-sky-400' : 'bg-sky-600 hover:bg-sky-700'
                          }`}
                        >
                          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                      </footer>
                    </form>
                  )}
                </ModalTrigger>
              </div>
            </div>
          )}

          {activeTab === 'citas' && (
            <div className="w-full animate-in slide-in-from-right-4 duration-500">
              <MedicalAppointments patientId={patientId} />
            </div>
          )}
          {activeTab === 'tratamientos' && (
            <div className="w-full animate-in slide-in-from-right-4 duration-500">
              <CurrentMedication patientId={patientId} />
            </div>
          )}
          {activeTab === 'pagos' && (
            <div className="w-full animate-in fade-in duration-500">
              <PaymentsBills patientId={patientId} />
            </div>
          )}
        </article>
      </section>
    </main>
  );
};