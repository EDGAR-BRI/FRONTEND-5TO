import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/react/primary/Avatar';
import PreviewBox from './PreviewBox';

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const people = [
  { name: 'Ana García', color: 'bg-blue-200 text-blue-800' },
  { name: 'Carlos Méndez', color: 'bg-purple-200 text-purple-800' },
  { name: 'Laura Ruiz', color: 'bg-pink-200 text-pink-800' },
];

export default function AvatarDemo() {
  return (
    <div className="not-content space-y-4">
      <PreviewBox label="Con foto de perfil">
        <Avatar className="w-10 h-10">
          <AvatarImage
            src="https://i.pravatar.cc/80?img=5"
            alt="Foto de perfil"
          />
        </Avatar>
        <Avatar className="w-14 h-14">
          <AvatarImage
            src="https://i.pravatar.cc/80?img=12"
            alt="Foto de perfil grande"
          />
        </Avatar>
      </PreviewBox>

      <PreviewBox label="Con iniciales (fallback)">
        {people.map(p => (
          <div key={p.name} className="flex items-center gap-2">
            <Avatar className="w-10 h-10">
              <AvatarFallback className={`${p.color} text-sm font-bold`}>
                {getInitials(p.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-(--sl-color-white)">{p.name}</span>
          </div>
        ))}
      </PreviewBox>

      <PreviewBox label="Tamaños">
        {['w-8 h-8', 'w-10 h-10', 'w-14 h-14', 'w-16 h-16'].map((size, i) => (
          <Avatar key={size} className={size}>
            <AvatarFallback className="bg-primary-200 text-primary-800 text-xs font-bold">
              JD
            </AvatarFallback>
          </Avatar>
        ))}
      </PreviewBox>
    </div>
  );
}
