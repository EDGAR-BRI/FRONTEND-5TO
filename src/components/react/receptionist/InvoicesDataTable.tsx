import { DataTable, type Column } from '@/components/react/primary/DataTable';
import { Badge } from '@/components/react/primary/Badge';

export type InvoiceItem = {
    nro: string;
    cliente: string;
    fecha: string;
    total: number;
    estado: string;
};

const statusBadgeStyles = (status: InvoiceItem['estado']) => {
    if (status === 'Emitida') return { bg: 'bg-primary-200/30', text: 'text-primary-700', border: 'border-primary-300' };
    if (status === 'Pendiente') return { bg: 'bg-primary-300/25', text: 'text-primary-800', border: 'border-primary-400' };
    return { bg: 'bg-error/15', text: 'text-error', border: 'border-error/20' };
};

const MOCK_FACTURAS: InvoiceItem[] = [
    { nro: 'FAC-2026-001', cliente: 'Ana Sofía Parra', fecha: '2026-03-02', total: 40.0, estado: 'Emitida' },
    { nro: 'FAC-2026-002', cliente: 'Jorge Luis Rivas', fecha: '2026-03-02', total: 80.0, estado: 'Pendiente' },
    { nro: 'FAC-2026-003', cliente: 'Carlos Méndez', fecha: '2026-03-01', total: 120.0, estado: 'Anulada' },
];

export function InvoicesDataTable({ facturas = MOCK_FACTURAS }: { facturas?: InvoiceItem[] }) {
    const columns: Column<InvoiceItem>[] = [
        {
            header: 'Nro. Factura',
            cell: (fac) => <span className="font-mono font-semibold">{fac.nro}</span>,
        },
        {
            header: 'Cliente',
            cell: (fac) => <span className="font-medium text-primary-900">{fac.cliente}</span>,
        },
        {
            header: 'Fecha',
            cell: (fac) => <span className="text-primary-700">{fac.fecha}</span>,
        },
        {
            header: 'Total',
            cell: (fac) => <span className="font-semibold text-primary-900">${fac.total.toFixed(2)}</span>,
        },
        {
            header: 'Estado',
            align: 'center',
            cell: (fac) => <Badge styles={statusBadgeStyles(fac.estado)}>{fac.estado}</Badge>,
        },
        {
            header: 'Acciones',
            align: 'center',
            cell: () => (
                <div className="flex justify-center gap-3">
                    <button className="text-primary-600 hover:text-primary-800 font-medium">
                        Imprimir
                    </button>
                    <button className="text-error hover:text-red-700 font-medium transition-colors">
                        Anular
                    </button>
                </div>
            ),
        },
    ];

    return (
        <DataTable<InvoiceItem>
            endpoint=""
            data={facturas}
            columns={columns}
            businessId={1}
        />
    );
}
