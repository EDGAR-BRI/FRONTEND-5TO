import { DataTable, type Column } from '@/components/react/primary/DataTable';
import { Badge } from '@/components/react/primary/Badge';
import type { Invoice } from '@/lib/services/finance/invoice/invoice.interface';
import { convertirAFechaISO } from '@/utils/helper_functions';
import { printInvoiceThermal } from '@/utils/printInvoice';

const statusBadgeStyles = (status: string) => {
    if (status === 'Pagada') return { bg: 'bg-primary-800/20', text: 'text-primary-900', border: 'border-primary-700/30' };
    if (status === 'Emitida') return { bg: 'bg-primary-200/30', text: 'text-primary-700', border: 'border-primary-300' };
    if (status === 'Pendiente') return { bg: 'bg-primary-300/25', text: 'text-primary-800', border: 'border-primary-400' };
    return { bg: 'bg-error/15', text: 'text-error', border: 'border-error/20' };
};


export function InvoicesDataTable({ facturas }: { facturas?: Invoice[] }) {
    const columns: Column<Invoice>[] = [
        {
            header: 'Nro. Factura',
            cell: (fac) => <span className="font-mono font-semibold">{fac.id}</span>,
        },
        {
            header: 'Cliente',
            cell: (fac) => (
                <span className="font-medium text-primary-900">
                    {fac.patient.name ?? fac.patient.user?.name ?? "No registrado"}
                </span>
            ),
        },
        {
            header: 'Fecha',
            cell: (fac) => <span className="text-primary-700">{convertirAFechaISO(fac.exchangeRate.createdAt)}</span>,
        },
        {
            header: 'Total',
            cell: (fac) => <span className="font-semibold text-primary-900">${fac.total_usd}</span>,
        },
        {
            header: 'Estado',
            align: 'center',
            cell: (fac) => <Badge styles={statusBadgeStyles(fac.status.name)}>{fac.status.name}</Badge>,
        },
        {
            header: 'Acciones',
            align: 'center',
            cell: (fac) => (
                <div className="flex justify-center gap-3">
                    <button 
                        className="text-primary-600 hover:text-primary-800 font-medium transition-colors"
                        onClick={() => printInvoiceThermal(fac)}
                    >
                        Imprimir
                    </button>
                </div>
            ),
        },
    ];

    return (
        <DataTable<Invoice>
            endpoint=""
            data={facturas}
            columns={columns}
        />
    );
}
