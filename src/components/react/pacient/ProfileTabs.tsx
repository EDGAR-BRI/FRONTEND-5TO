import { useState } from 'react';
import { ContactInfo } from './ContactInfo';
import { EmergencyContact } from './EmergencyContact';
import { MedicalAppointments } from './MedicalAppointments';
import { CurrentMedication } from './CurrentMedication';
import { PaymentsBills } from './PaymentsBills';
import StaticCard from '@/components/react/primary/StaticCard'; 

import { ModalTrigger } from '@/components/react/primary/ModalTrigger';

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
} from 'react-icons/fa6';
import { Button } from '../primary/Button';

export const ProfileTabs = ({ patientId }: { patientId: string }) => {
  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    { id: 'personal', label: 'Inf. Personal', icon: FaCircleUser },
    { id: 'citas', label: 'Citas Médicas', icon: FaCalendarDays },
    { id: 'tratamientos', label: 'Tratamientos', icon: FaPills },
    { id: 'pagos', label: 'Facturación', icon: FaReceipt },
  ];

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
                    <form className="space-y-6 p-2" onSubmit={(e) => e.preventDefault()}>
                      
                      <StaticCard className="p-6">
                        <div className="flex items-center gap-2 mb-6 border-b border-primary-200 pb-3">
                          <FaPhone className="w-4 h-4 text-primary-600" />
                          <h4 className="text-xs font-black text-primary-700 uppercase tracking-widest">Información de Contacto</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase italic">Correo Electrónico</label>
                            <div className="relative">
                              <input type="email" defaultValue="pedro.sanchez@gmail.com" className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 ring-primary-500" />
                              <FaEnvelope className="w-4 h-4 absolute right-3 top-3.5 text-slate-300" />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase italic">Teléfono Móvil</label>
                            <div className="relative">
                              <input type="text" defaultValue="+58 412-1234567" className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 ring-primary-500" />
                              <FaPhone className="w-4 h-4 absolute right-3 top-3.5 text-slate-300" />
                            </div>
                          </div>

                          <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase italic">Dirección de Residencia</label>
                            <div className="relative">
                              <input type="text" defaultValue="Pueblo Nuevo, Edificio Sol, Apto 4B." className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 ring-primary-500" />
                              <FaLocationDot className="w-4 h-4 absolute right-3 top-3.5 text-slate-300" />
                            </div>
                          </div>
                        </div>
                      </StaticCard>

                      <StaticCard className="p-6">
                        <div className="flex items-center gap-2 mb-6 border-b border-red-100 pb-3">
                          <FaShieldHalved className="w-4 h-4 text-red-500" />
                          <h4 className="text-xs font-black text-red-600 uppercase tracking-widest">Contacto de Emergencia</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase italic">Nombre Completo</label>
                            <div className="relative">
                              <input type="text" defaultValue="María Rodríguez" className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 ring-primary-500" />
                              <FaUser className="w-4 h-4 absolute right-3 top-3.5 text-slate-300" />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase italic">Parentesco</label>
                            <select className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 ring-primary-500 appearance-none bg-transparent">
                              <option value="madre">Madre</option>
                              <option value="padre">Padre</option>
                              <option value="esposo">Esposo/a</option>
                            </select>
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
                          className="flex-1 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 shadow-lg"
                        >
                          Guardar Cambios
                        </button>
                      </footer>
                    </form>
                  )}
                </ModalTrigger>
              </div>
            </div>
          )}

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