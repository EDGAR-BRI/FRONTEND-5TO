import React from 'react';
import { Badge } from '@/components/react/primary/Badge';
import PreviewBox from './PreviewBox';

function LabeledBadge({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {children}
      <span className="text-[10px] font-mono text-cool-gray-50">{label}</span>
    </div>
  );
}

export default function BadgeDemo() {
  return (
    <div className="not-content space-y-4">
      <PreviewBox label="Default">
        <LabeledBadge label="sin styles">
          <Badge>Default</Badge>
        </LabeledBadge>
      </PreviewBox>

      <PreviewBox label="Estados de cita (bg + text + border)">
        <LabeledBadge label="bg-green-100 / text-green-700">
          <Badge styles={{ bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' }}>
            Confirmada
          </Badge>
        </LabeledBadge>
        <LabeledBadge label="bg-yellow-100 / text-yellow-700">
          <Badge styles={{ bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' }}>
            Pendiente
          </Badge>
        </LabeledBadge>
        <LabeledBadge label="bg-red-100 / text-red-700">
          <Badge styles={{ bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' }}>
            Cancelada
          </Badge>
        </LabeledBadge>
        <LabeledBadge label="bg-blue-100 / text-blue-700">
          <Badge styles={{ bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' }}>
            En curso
          </Badge>
        </LabeledBadge>
      </PreviewBox>

      <PreviewBox label="Roles (con font semibold)">
        <LabeledBadge label="Doctor — purple">
          <Badge styles={{ bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', font: 'font-semibold' }}>
            Doctor
          </Badge>
        </LabeledBadge>
        <LabeledBadge label="Recepcionista — blue">
          <Badge styles={{ bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', font: 'font-semibold' }}>
            Recepcionista
          </Badge>
        </LabeledBadge>
        <LabeledBadge label="Admin — orange">
          <Badge styles={{ bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', font: 'font-semibold' }}>
            Admin
          </Badge>
        </LabeledBadge>
      </PreviewBox>

      <PreviewBox label="Sin borde (borderWidth: 'border-0')">
        <LabeledBadge label="border-0">
          <Badge styles={{ borderWidth: 'border-0', bg: 'bg-primary-200', text: 'text-primary-900', font: 'font-medium' }}>
            Sin borde
          </Badge>
        </LabeledBadge>
      </PreviewBox>
    </div>
  );
}
