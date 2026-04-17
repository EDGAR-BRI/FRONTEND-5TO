import { FaShieldHalved, FaUser, FaPhone } from 'react-icons/fa6';
import StaticCard from '@/components/react/primary/StaticCard';

export const EmergencyContact = () => {
  const data = {
    nombre: "María Rodríguez",
    parentesco: "Madre",
    telefono: "+58 424-9876543"
  };

  return (
    <StaticCard className="w-full p-6">
      <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
        <FaShieldHalved className="w-4 h-4 text-red-500" />
        Contacto de Emergencia
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 bg-white/50 p-3 rounded-xl border border-slate-100 shadow-sm">
          <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-50">
            <FaUser className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase italic">Nombre / Parentesco</p>
            <p className="text-sm font-medium text-slate-700">{data.nombre} ({data.parentesco})</p>
          </div>
        </div>

        <section className="flex items-center gap-3 bg-white/50 p-3 rounded-xl border border-slate-100 shadow-sm">
          <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-50">
            <FaPhone className="w-4 h-4 text-slate-400" />
          </div>
          <section>
            <p className="text-[10px] font-bold text-slate-400 uppercase italic">Teléfono</p>
            <p className="text-sm font-medium text-slate-700">{data.telefono}</p>
          </section>
        </section>
      </div>
    </StaticCard>
  );
};