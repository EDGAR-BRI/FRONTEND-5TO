import React, { useState } from 'react';
import { Field } from '@/components/react/primary/Field';
import PreviewBox from './PreviewBox';

export default function FieldDemo() {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    precio: '',
    fecha: '',
    genero: 'M',
  });

  const handle = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [name]: e.target.value }));

  return (
    <div className="not-content space-y-4">
      <PreviewBox label="Texto" className="flex-col items-stretch">
        <Field
          name="nombre"
          label="Nombre del paciente"
          placeholder="Ej: Juan Pérez"
          value={form.nombre}
          onChange={handle('nombre')}
        />
      </PreviewBox>

      <PreviewBox label="Email" className="flex-col items-stretch">
        <Field
          name="email"
          label="Correo electrónico"
          type="email"
          placeholder="doctor@clinica.com"
          value={form.email}
          onChange={handle('email')}
        />
      </PreviewBox>

      <PreviewBox label="Contraseña con toggle" className="flex-col items-stretch">
        <Field
          name="password"
          label="Contraseña"
          type="password"
          showTogglePassword
          placeholder="••••••••"
          value={form.password}
          onChange={handle('password')}
        />
      </PreviewBox>

      <PreviewBox label="Número" className="flex-col items-stretch">
        <Field
          name="precio"
          label="Precio de consulta ($)"
          type="number"
          placeholder="0.00"
          step="0.01"
          value={form.precio}
          onChange={handle('precio')}
        />
      </PreviewBox>

      <PreviewBox label="Fecha con calendario custom" className="flex-col items-stretch">
        <Field
          name="fecha"
          label="Fecha de la cita"
          type="date"
          useNativeDatePicker={false}
          value={form.fecha}
          onChange={handle('fecha')}
        />
      </PreviewBox>

      <PreviewBox label="Radio buttons" className="flex-col items-stretch">
        <Field
          name="genero"
          label="Género"
          type="radio"
          options={[
            { label: 'Masculino', value: 'M' },
            { label: 'Femenino', value: 'F' },
            { label: 'Otro', value: 'O' },
          ]}
          value={form.genero}
          onChange={handle('genero')}
        />
      </PreviewBox>

      <PreviewBox label="Con tooltip" className="flex-col items-stretch">
        <Field
          name="cedula"
          label="Cédula"
          tooltip="Ingresa el número de cédula sin guiones ni espacios."
          placeholder="1234567890"
          value=""
          onChange={() => {}}
        />
      </PreviewBox>
    </div>
  );
}
