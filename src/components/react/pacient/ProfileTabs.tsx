import React, { useState } from 'react';
import { ContactInfo } from './ContactInfo';
import { EmergencyContact } from './EmergencyContact';
import { MedicalAppointments } from './MedicalAppointments.tsx';
import { CurrentMedication } from './CurrentMedication';
import { PaymentsBills } from './PaymentsBills';

import {
  UserCircle, CalendarDays, Pill, Receipt, Settings2,
  Mail, Phone, MapPin, User, ShieldAlert, X
} from 'lucide-react';
import { Button } from '../primary/Button.tsx';

export const ProfileTabs = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [showModal, setShowModal] = useState(false);

  const tabs = [
    { id: 'personal', label: 'Inf. Personal', icon: UserCircle },
    { id: 'citas', label: 'Citas Médicas', icon: CalendarDays },
    { id: 'tratamientos', label: 'Tratamientos', icon: Pill },
    { id: 'pagos', label: 'Facturación', icon: Receipt },
  ];

  return (
    <main className="flex flex-col gap-6 w-full h-full relative">
      {/* NAVEGACIÓN SEMÁNTICA */}
      <nav className="flex bg-white p-1.5 gap-3 rounded-lg shadow-sm border border-primary-200 transition-all hover:border-primary-400 w-fit" aria-label="Menú de perfil">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Button
              label='s'
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </Button>
          );
        })}
      </nav>

      {/* CONTENIDO DINÁMICO COMO SECCIÓN */}
      <section className="flex-1">
        <article className="h-full">
          {activeTab === 'personal' && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-500">
              <ContactInfo />
              <EmergencyContact />
            </div>
          )}
          {activeTab === 'citas' && (
            <div className="animate-in slide-in-from-right-4 duration-500">
              <MedicalAppointments />
            </div>
          )}
          {activeTab === 'tratamientos' && (
            <div className="animate-in slide-in-from-right-4 duration-500">
              <CurrentMedication />
            </div>
          )}
          {activeTab === 'pagos' && (
            <div className="animate-in fade-in duration-500">
              <PaymentsBills />
            </div>
          )}
        </article>
      </section>

      {/* PIE DE PÁGINA PARA ACCIONES */}
      {activeTab === 'personal' && (
        <footer className="pt-2 animate-in slide-in-from-bottom-2">
          <Button
            label='Gestionar Perfil Completo'
            onClick={() => setShowModal(true)}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
          >
            <Settings2 className="w-5 h-5" />
            Gestionar y Editar Perfil Completo
          </Button>
        </footer>
      )}
      {showModal && (
        <dialog open className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto w-full h-full border-none">
          <section className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl relative animate-in zoom-in-95 duration-200 my-8 overflow-hidden">

            <header className="p-8 pb-0">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
              <h3 className="text-2xl font-bold text-slate-800">Gestionar Perfil</h3>
              <p className="text-slate-500 text-sm font-medium">Actualiza tu información personal y de seguridad.</p>
            </header>

            <form className="p-8 space-y-8" onSubmit={(e) => e.preventDefault()}>
              <fieldset className="space-y-4 border-none p-0 m-0 bg-red-50/30 rounded-2xl border border-red-50 mt-12">
                <legend className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Phone className="w-3 h-3" /> Información de Contacto
                </legend>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase ml-1 italic">Correo Electrónico</label>
                    <div className="relative">
                      <input id="email" type="email" defaultValue="pedro.sanchez@gmail.com" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 ring-blue-500" />
                      <Mail className="w-4 h-4 absolute right-3 top-3.5 text-slate-300" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="phone" className="text-[10px] font-bold text-slate-400 uppercase ml-1 italic">Teléfono Móvil</label>
                    <div className="relative">
                      <input id="phone" type="text" defaultValue="+58 412-1234567" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 ring-blue-500" />
                      <Phone className="w-4 h-4 absolute right-3 top-3.5 text-slate-300" />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label htmlFor="address" className="text-[10px] font-bold text-slate-400 uppercase ml-1 italic">Residencia</label>
                    <div className="relative">
                      <input id="address" type="text" defaultValue="Pueblo Nuevo, Edificio Sol, Apto 4B." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 ring-blue-500" />
                      <MapPin className="w-4 h-4 absolute right-3 top-3.5 text-slate-300" />
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* GRUPO: EMERGENCIA */}
              <fieldset className="space-y-4 border-none m-0 bg-red-50/30 p-4 rounded-2xl border border-red-50">
                <legend className="text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-3 h-3" /> Contacto de Emergencia
                </legend>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="emergency-name" className="text-[10px] font-bold text-slate-400 uppercase ml-1 italic">Nombre Completo</label>
                    <div className="relative">
                      <input id="emergency-name" type="text" defaultValue="María Rodríguez" className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 ring-red-400" />
                      <User className="w-4 h-4 absolute right-3 top-3.5 text-slate-300" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="relation" className="text-[10px] font-bold text-slate-400 uppercase ml-1 italic">Parentesco</label>
                    <select id="relation" className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 ring-red-400 appearance-none">
                      <option value="madre">Madre</option>
                      <option value="padre">Padre</option>
                      <option value="esposo">Esposo/a</option>
                    </select>
                  </div>
                </div>
              </fieldset>

              <footer className="flex gap-3 mt-10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 border border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                >
                  Guardar Cambios
                </button>
              </footer>
            </form>
          </section>
        </dialog>
      )}
    </main>
  );
};