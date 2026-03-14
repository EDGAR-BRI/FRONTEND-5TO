import React from 'react';
import ActionCard from '@/components/react/primary/ActionCard';
import StaticCard from '@/components/react/primary/StaticCard';
import { Badge } from '@/components/react/primary/Badge';
import { Avatar, AvatarFallback } from '@/components/react/primary/Avatar';
import PreviewBox from './PreviewBox';

export default function CardsDemo() {
  return (
    <div className="not-content space-y-4">
      <PreviewBox label="ActionCard — clickeable" className="flex-col w-full gap-3">
        {['Dr. García — Cardiología', 'Dra. López — Pediatría', 'Dr. Martínez — Neurología'].map((doc, i) => (
          <ActionCard key={i} onClick={() => alert(`Navegando a ${doc}`)}>
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-primary-200 text-primary-800 text-xs font-bold">
                  {doc.split(' ')[1][0] + doc.split(' ')[2][0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm text-primary-900">{doc.split('—')[0].trim()}</p>
                <p className="text-xs text-(--sl-color-gray-3)">{doc.split('—')[1].trim()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge styles={{ bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' }}>
                Activo
              </Badge>
              <span className="text-primary-600 text-sm">›</span>
            </div>
          </ActionCard>
        ))}
      </PreviewBox>

      <PreviewBox label="StaticCard — informativa">
        <StaticCard className="w-full max-w-xs">
          <h3 className="text-sm font-semibold text-primary-900 mb-3">Información del paciente</h3>
          <div className="space-y-1.5 text-sm">
            <p><span className="text-(--sl-color-gray-3)">Nombre:</span> <span className="text-primary-900 font-medium">Juan Pérez</span></p>
            <p><span className="text-(--sl-color-gray-3)">Edad:</span> <span className="text-primary-900 font-medium">34 años</span></p>
            <p><span className="text-(--sl-color-gray-3)">Sangre:</span> <span className="text-primary-900 font-medium">O+</span></p>
            <p><span className="text-(--sl-color-gray-3)">Última cita:</span> <span className="text-primary-900 font-medium">14/03/2026</span></p>
          </div>
        </StaticCard>
      </PreviewBox>
    </div>
  );
}
