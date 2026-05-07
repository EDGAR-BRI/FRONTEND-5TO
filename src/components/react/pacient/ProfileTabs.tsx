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
  FaNotesMedical
} from 'react-icons/fa6';

export const ProfileTabs = ({ patientId }: { patientId: string }) => {
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

  // Sincronizamos los estados cuando llegan los datos del backend
  useEffect(() => {
    if (patientData?.data) {
      setBloodType(patientData.data.blood_type || '');
      setChronicDiseases(patientData.data.chronic_diseases || '');
      setAllergies(patientData.data.allergies || '');
      setEmail(patientData.data.email || '');
      setMainPhone(patientData.data.main_phone || '');
      setAddress(patientData.data.address || '');
    }
  }, [patientData]);

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
        close(); // Cerramos el modal
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
    <main className="flex flex-col gap-6 w-full h-full relative">

      {/* NAVEGACIÓN SEMÁNTICA - RESPONSIVE */}
      <nav 
        className="flex flex-wrap bg-white p-1.5 gap-2 rounded-lg shadow-sm border border-primary-200 transition-all hover:border-primary-400 w-full" 
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
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold flex-1 min-w-[130px] transition-all border ${
                isActive 
                  ? '!bg-blue-600 !text-white shadow-md border-transparent' 
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
      <section className="flex-1 w-full">
        <article className="h-full w-full">
          {activeTab === 'personal' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500 w-full">
              
              <div className="grid grid-cols-1 gap-6 w-full">
                <div className="w-full transition-all duration-300">
                  <ContactInfo patientId={patientId} />
                </div>
                <div className="w-full transition-all duration-300">
                  <EmergencyContact patientId={patientId} />
                </div>
              </div>

              {/* IMPLEMENTACIÓN DEL MODAL TRIGGER */}
              <div className="pt-2 w-full">
                <ModalTrigger
                  modalTitle="Gestionar Perfil"
                  trigger={
                    <Button
                      label=""
                      className="w-full py-5 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 text-base border-none"
                    >
                      <FaGears className="w-5 h-5" />
                      Gestionar y Editar Perfil Completo
                    </Button>
                  }
                >
                  {({ close }) => (
                    <form className="space-y-6 p-2" onSubmit={(e) => handleSaveChanges(e, close)}>
                      
                      {/* DATOS MÉDICOS REALES (Los que sí van a la BD) */}
                      <StaticCard className="p-6">
                        <div className="flex items-center gap-2 mb-6 border-b border-primary-200 pb-3">
                          <FaNotesMedical className="w-4 h-4 text-primary-600" />
                          <h4 className="text-xs font-black text-primary-700 uppercase tracking-widest">Información Médica</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-5">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase italic">Tipo de Sangre</label>
                            <div className="relative">
                              <input 
                                type="text" 
                                value={bloodType}
                                onChange={(e) => setBloodType(e.target.value)}
                                placeholder="Ej: O+, A-, AB+" 
                                maxLength={10}
                                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 ring-primary-500" 
                              />
                              <FaDroplet className="w-4 h-4 absolute right-3 top-3.5 text-red-400" />
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

                      <footer className="flex gap-4 mt-8">
                        <button
                          type="button"
                          onClick={close}
                          className="flex-1 py-4 border border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className={`flex-1 py-4 text-white font-bold rounded-2xl shadow-lg transition-all ${
                            isSaving ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
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

          {/* ... el resto de tus pestañas (citas, tratamientos, pagos) se quedan exactamente igual ... */}
          {activeTab === 'citas' && (
            <div className="animate-in slide-in-from-right-4 duration-500 w-full">
              <MedicalAppointments patientId={patientId} />
            </div>
          )}
          {activeTab === 'tratamientos' && (
            <div className="animate-in slide-in-from-right-4 duration-500 w-full">
              <CurrentMedication patientId={patientId} />
            </div>
          )}
          {activeTab === 'pagos' && (
            <div className="animate-in fade-in duration-500 w-full">
              <PaymentsBills patientId={patientId} />
            </div>
          )}
        </article>
      </section>
    </main>
  );
};