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
        data={mockDoctors}
        columns={columns}
        className="rounded-none border-0"
      />
    </PreviewBox>
  );
}

export function SimpleTableDemo() {
  const doctors = [
    { id: 1, name: 'Dr. García', specialty: 'Cardiología' },
    { id: 2, name: 'Dra. López', specialty: 'Pediatría' },
    { id: 3, name: 'Dr. Martínez', specialty: 'Neurología' },
  ];
  
  const simpleCols: Column<any>[] = [
    { header: 'ID', accessorKey: 'id' },
    { header: 'Nombre', accessorKey: 'name' },
    { header: 'Especialidad', accessorKey: 'specialty' },
  ];

  return (
      <DataTable
        endpoint=""
        data={doctors}
        columns={simpleCols}
        className="rounded-none border-0 shadow-none"
      />
  );
}

export function BadgeTableDemo() {
    const doctors = [
      { id: 1, name: 'Dr. García', active: true },
      { id: 2, name: 'Dra. López', active: true },
      { id: 3, name: 'Dr. Martínez', active: false },
    ];

    const badgeCols: Column<any>[] = [
      { header: 'Nombre', accessorKey: 'name' },
      { 
        header: 'Estado', 
        align: 'center',
        cell: (item) => (
          <Badge styles={{ bg: item.active ? 'bg-green-100' : 'bg-red-100', text: item.active ? 'text-green-700' : 'text-red-700', border: item.active ? 'border-green-300' : 'border-red-300' }}>
            {item.active ? 'Activo' : 'Inactivo'}
          </Badge>
        )
      },
    ];

    return (
        <DataTable endpoint="" data={doctors} columns={badgeCols} className="rounded-none border-0 shadow-none" />
    );
}
