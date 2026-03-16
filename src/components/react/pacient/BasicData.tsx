import React from "react";
import { CalendarDays, User, Droplet, Scale, Phone, Mail, MapPin, CreditCard } from "lucide-react";
import StaticCard from "@/components/react/primary/StaticCard"; 

export const BasicData = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6 h-full">
      
      <div className="flex flex-col items-center gap-3">
        <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden">
          <img 
            src="https://i.pravatar.cc/150?img=11" 
            alt="Perfil del paciente" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">Juan Pérez</h2>
          <p className="text-sm text-slate-500 flex items-center justify-center gap-1">
            <CreditCard className="w-4 h-4" /> V-12.345.678
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        
        <StaticCard className="flex flex-col items-center justify-center gap-1 py-4 text-center">
          <CalendarDays className="w-6 h-6 text-primary-600 mb-1" />
          <span className="text-sm font-medium text-slate-500">Edad</span>
          <span className="text-lg font-bold text-slate-800">45 años</span>
        </StaticCard>

        <StaticCard className="flex flex-col items-center justify-center gap-1 py-4 text-center">
          <User className="w-6 h-6 text-primary-600 mb-1" />
          <span className="text-sm font-medium text-slate-500">Género</span>
          <span className="text-lg font-bold text-slate-800">Masculino</span>
        </StaticCard>

        <StaticCard className="flex flex-col items-center justify-center gap-1 py-4 text-center">
          <Droplet className="w-6 h-6 text-primary-600 mb-1" />
          <span className="text-sm font-medium text-slate-500">Sangre</span>
          <span className="text-lg font-bold text-slate-800">O+</span>
        </StaticCard>

        <StaticCard className="flex flex-col items-center justify-center gap-1 py-4 text-center">
          <Scale className="w-6 h-6 text-primary-600 mb-1" />
          <span className="text-sm font-medium text-slate-500">Peso</span>
          <span className="text-lg font-bold text-slate-800">78 kg</span>
        </StaticCard>

      </div>

      {/*Información de contacto */}
      <div className="flex flex-col gap-2 mt-2 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
          <Phone className="w-5 h-5 text-slate-400" />
          <span className="text-sm text-slate-600">+58 412 123 4567</span>
        </div>
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
          <Mail className="w-5 h-5 text-slate-400" />
          <span className="text-sm text-slate-600">juanperez@ejemplo.com</span>
        </div>
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
          <MapPin className="w-5 h-5 text-slate-400" />
          <span className="text-sm text-slate-600">Barquisimeto, Lara</span>
        </div>
      </div>

    </div>
  );
};