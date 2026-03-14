import React from 'react';
import { Spinner } from '@/components/react/primary/Spinner';
import { Tooltip } from '@/components/react/primary/Tooltip';
import PreviewBox from './PreviewBox';

export default function SpinnerTooltipDemo() {
  return (
    <div className="not-content space-y-4">
      <PreviewBox label="Spinner — tamaños">
        <Spinner className="w-4 h-4 text-primary-600" />
        <Spinner className="w-6 h-6 text-primary-600" />
        <Spinner className="w-8 h-8 text-primary-600" />
        <Spinner className="w-12 h-12 text-primary-600" />
      </PreviewBox>

      <PreviewBox label="Spinner — colores">
        <Spinner className="w-6 h-6 text-primary-600" />
        <Spinner className="w-6 h-6 text-green-500" />
        <Spinner className="w-6 h-6 text-red-500" />
        <Spinner className="w-6 h-6 text-yellow-500" />
        <Spinner className="w-6 h-6 text-white" />
      </PreviewBox>

      <PreviewBox label="Tooltip — hover sobre el ícono ?">
        <div className="flex items-center gap-2 text-sm text-(--sl-color-white)">
          <span>Cédula</span>
          <Tooltip text="Ingresa el número de cédula sin guiones ni espacios." />
        </div>
        <div className="flex items-center gap-2 text-sm text-(--sl-color-white)">
          <span>Precio</span>
          <Tooltip text="Ingresa el monto en dólares sin incluir centavos." />
        </div>
      </PreviewBox>
    </div>
  );
}
