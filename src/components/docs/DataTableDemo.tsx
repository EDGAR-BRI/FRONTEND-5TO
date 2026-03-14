import React from 'react';
import { DataTable } from '@/components/react/primary/DataTable';
import type { Column } from '@/components/react/primary/DataTable';
import { Badge } from '@/components/react/primary/Badge';
import { Button } from '@/components/react/primary/Button';
import PreviewBox from './PreviewBox';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  status: 'active' | 'inactive';
  patients: number;
}

const mockDoctors: Doctor[] = [
  { id: 1, name: 'Dr. García',   specialty: 'Cardiología',  status: 'active',   patients: 42 },
  { id: 2, name: 'Dra. López',   specialty: 'Pediatría',    status: 'active',   patients: 58 },
  { id: 3, name: 'Dr. Martínez', specialty: 'Neurología',   status: 'inactive', patients: 31 },
  { id: 4, name: 'Dra. Ruiz',    specialty: 'Dermatología', status: 'active',   patients: 27 },
];

const columns: Column<Doctor>[] = [
  { header: 'Nombre', accessorKey: 'name' },
  { header: 'Especialidad', accessorKey: 'specialty' },
  {
    header: 'Pacientes',
    accessorKey: 'patients',
    align: 'center',
  },
  {
    header: 'Estado',
    align: 'center',
    cell: (doc) =>
      doc.status === 'active' ? (
        <Badge styles={{ bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' }}>
          Activo
        </Badge>
      ) : (
        <Badge styles={{ bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' }}>
          Inactivo
        </Badge>
      ),
  },
  {
    header: 'Acciones',
    align: 'center',
    cell: (doc) => (
      <Button label="Ver" size="sm" variant="ghost" onClick={() => alert(`Ver Dr. ${doc.name}`)} />
    ),
  },
];

export default function DataTableDemo() {
  return (
    <PreviewBox label="DataTable con datos locales y render personalizado" className="flex-col items-stretch p-0 overflow-hidden">
      <DataTable
        endpoint=""
        businessId={1}
        data={mockDoctors}
        columns={columns}
        className="rounded-none border-0"
      />
    </PreviewBox>
  );
}
