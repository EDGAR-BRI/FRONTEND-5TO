import { FaPills, FaFloppyDisk, FaCircleInfo, FaPlus } from 'react-icons/fa6';
import { ModalTrigger } from '../primary/ModalTrigger';
import { Field } from '../primary/Field';
import { Select } from '../primary/Select';
import { Button } from '../primary/Button';
import StaticCard from '../primary/StaticCard';

export const AddMedicationModal = () => {
  return (
    <ModalTrigger
      modalTitle="Registro de Tratamiento"
      trigger={
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-100">
          <FaPlus className="w-4 h-4" /> Añadir Medicamento
        </button>
      }
    >
      {({ close }) => (
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
            <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
              <FaPills className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">Nuevo Tratamiento</p>
              <h2 className="text-lg font-bold text-slate-800">Registrar Medicamento</h2>
            </div>
          </div>

          {/* CUERPO DEL FORMULARIO EN STATICCARD */}
          <StaticCard className="p-6 bg-white border-slate-100 shadow-none space-y-4">
            <div className="grid grid-cols-2 gap-4 text-left">
              <Field name="medicamento" label="Medicamento" placeholder="Ej: Losartán" required />
              <Field name="dosis" label="Dosis" placeholder="Ej: 50mg" required />
            </div>

            <Select 
              name="frecuencia"
              label="Frecuencia de toma"
              placeholder="Seleccionar opción"
              options={[
                { value: '8h', label: 'Cada 8 horas' },
                { value: '12h', label: 'Cada 12 horas' },
                { value: '24h', label: 'Una vez al día (24h)' },
              ]}
            />

            <Field name="duracion" label="Duración" placeholder="Ej: 7 días" />
          </StaticCard>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-left">
            <FaCircleInfo className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 leading-tight">
              Asegúrese de seguir las indicaciones exactas de su médico.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button label="Cancelar" variant="secondary" onClick={close} adaptive />
            <Button label="Guardar Receta" variant="primary" onClick={close} adaptive>
              <FaFloppyDisk className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </ModalTrigger>
  );
};