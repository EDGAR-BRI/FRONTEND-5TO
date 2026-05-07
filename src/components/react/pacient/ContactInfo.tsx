import { useState, useEffect } from 'react';
import { FaEnvelope, FaPhone, FaLocationDot, FaPencil } from 'react-icons/fa6';
import StaticCard from '@/components/react/primary/StaticCard';
import { Button } from '../primary/Button';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { api } from '@/lib/api';

const InputField = ({ label, name, value, onChange, type = "text", placeholder }: any) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-slate-600 uppercase">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
    />
  </div>
);

export const ContactInfo = ({ patientId }: { patientId: string }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    main_phone: '',
    secondary_phone: '',
    address: '',
    city: ''
  });

  const { data: patientData, mutate } = useSWR(`/medical/patient/${patientId}`, fetcher);

  useEffect(() => {
    if (patientData?.data?.info_patient) {
      const info = patientData.data.info_patient;
      setFormData({
        email: info.email || '',
        main_phone: info.main_phone || '',
        secondary_phone: info.secondary_phone || '',
        address: info.address || '',
        city: info.city || ''
      });
    }
  }, [patientData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api(`/medical/info-patient/patient/${patientId}/contact`, {
        method: 'PATCH',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        mutate();
        setIsEditing(false);
        alert('Información de contacto actualizada');
      } else {
        alert('Error al guardar');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StaticCard className="w-full flex flex-col h-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <FaPhone className="w-5 h-5 text-blue-500" /> Información de Contacto
        </h2>
        {!isEditing && (
          <Button 
            variant="secondary" 
            onClick={() => setIsEditing(true)}
            className="text-xs"
          >
            <FaPencil size={12} /> Editar
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <InputField
            label="Correo Electrónico"
            name="email"
            value={formData.email}
            onChange={(e: any) => setFormData({...formData, email: e.target.value})}
            type="email"
            placeholder="correo@ejemplo.com"
          />
          <InputField
            label="Teléfono Principal"
            name="main_phone"
            value={formData.main_phone}
            onChange={(e: any) => setFormData({...formData, main_phone: e.target.value})}
            placeholder="0412-123-4567"
          />
          <InputField
            label="Teléfono Secundario"
            name="secondary_phone"
            value={formData.secondary_phone}
            onChange={(e: any) => setFormData({...formData, secondary_phone: e.target.value})}
            placeholder="0414-123-4567"
          />
          <InputField
            label="Dirección"
            name="address"
            value={formData.address}
            onChange={(e: any) => setFormData({...formData, address: e.target.value})}
            placeholder="Dirección completa"
          />
          <InputField
            label="Ciudad"
            name="city"
            value={formData.city}
            onChange={(e: any) => setFormData({...formData, city: e.target.value})}
            placeholder="Ciudad"
          />
          <div className="flex gap-2 mt-4">
            <Button 
              variant="primary" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl shadow-sm border border-slate-100">
            <FaEnvelope className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Correo Electrónico</p>
              <p className="text-sm text-slate-600">{formData.email || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl shadow-sm border border-slate-100">
            <FaPhone className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Teléfono Principal</p>
              <p className="text-sm text-slate-600">{formData.main_phone || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl shadow-sm border border-slate-100">
            <FaPhone className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Teléfono Secundario</p>
              <p className="text-sm text-slate-600">{formData.secondary_phone || '-'}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white/50 p-4 rounded-2xl shadow-sm border border-slate-100">
            <FaLocationDot className="w-5 h-5 text-slate-400 mt-1" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Residencia</p>
              <p className="text-sm text-slate-600">
                {formData.address || '-'}
                {formData.city && `, ${formData.city}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </StaticCard>
  );
};