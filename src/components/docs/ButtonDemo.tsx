import React, { useState } from 'react';
import { Button } from '@/components/react/primary/Button';
import PreviewBox from './PreviewBox';

function LabeledItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {children}
      <span className="text-[10px] font-mono text-cool-gray-50">{label}</span>
    </div>
  );
}

export default function ButtonDemo() {
  const [loading, setLoading] = useState(false);

  const simulateLoad = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="not-content space-y-4">
      <PreviewBox label="Variantes">
        <LabeledItem label="primary (default)">
          <Button label="Guardar cambios" variant="primary" />
        </LabeledItem>
        <LabeledItem label="secondary">
          <Button label="Cancelar" variant="secondary" />
        </LabeledItem>
        <LabeledItem label="ghost">
          <Button label="Ver detalle" variant="ghost" />
        </LabeledItem>
        <LabeledItem label="danger-ghost">
          <Button label="Eliminar" variant="danger-ghost" />
        </LabeledItem>
      </PreviewBox>

      <PreviewBox label="Tamaños">
        <LabeledItem label='size="sm"'>
          <Button label="Pequeño" size="sm" />
        </LabeledItem>
        <LabeledItem label='size="default"'>
          <Button label="Normal" size="default" />
        </LabeledItem>
        <LabeledItem label='size="lg"'>
          <Button label="Grande" size="lg" />
        </LabeledItem>
        <LabeledItem label='size="icon"'>
          <Button label="★" size="icon" />
        </LabeledItem>
      </PreviewBox>

      <PreviewBox label="Estados">
        <LabeledItem label="disabled">
          <Button label="Deshabilitado" disabled />
        </LabeledItem>
        <LabeledItem label="loading (clic para probar)">
          <Button
            label={loading ? 'Guardando...' : 'Simular carga'}
            loading={loading}
            onClick={simulateLoad}
          />
        </LabeledItem>
      </PreviewBox>

      <PreviewBox label="adaptive — ancho completo" className="flex-col items-stretch">
        <Button label="Iniciar sesión" adaptive />
      </PreviewBox>
    </div>
  );
}
