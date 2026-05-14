import React, { useState, useEffect } from 'react';
import { Button } from '@/components/react/primary/Button';
import { Field } from '@/components/react/primary/Field';
import { InvoicesDataTable } from './InvoicesDataTable';
import { CreateInvoiceModal } from './CreateInvoiceModal';
import type { Invoice } from '@/lib/services/finance/invoice/invoice.interface';

interface Props {
    receptionistId: string;
    initialInvoices: Invoice[];
}

export function InvoiceManagement({ receptionistId, initialInvoices }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [initialAppointmentId, setInitialAppointmentId] = useState<number | undefined>();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const appointmentId = urlParams.get('appointmentId');
        if (appointmentId) {
            setInitialAppointmentId(parseInt(appointmentId));
            setIsModalOpen(true);
            
            // Clean up the URL
            const url = new URL(window.location.href);
            url.searchParams.delete('appointmentId');
            window.history.replaceState({}, '', url.toString());
        }
    }, []);

    const filteredInvoices = invoices.filter(fac => {
        const search = searchTerm.toLowerCase();
        const clientName = (fac.patient.name ?? fac.patient.user?.name ?? "").toLowerCase();
        const invoiceId = String(fac.id);
        return clientName.includes(search) || invoiceId.includes(search);
    });

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-primary-900">Facturación y Cobros</h1>
                <p className="text-primary-600">Genera facturas legales y gestiona comprobantes pendientes.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
                <div className="w-full md:w-96">
                    <Field
                        name="search"
                        type="text"
                        placeholder="Buscar por cliente o Nro de factura..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-3">
                    <Button 
                        label="+ Nueva Factura" 
                        variant="primary"
                        onClick={() => setIsModalOpen(true)}
                    />
                </div>
            </div>

            <InvoicesDataTable facturas={filteredInvoices} />

            <CreateInvoiceModal 
                isOpen={isModalOpen} 
                onClose={() => {
                    setIsModalOpen(false);
                    setInitialAppointmentId(undefined);
                }}
                receptionistId={parseInt(receptionistId)}
                initialAppointmentId={initialAppointmentId}
                onSuccess={(newInvoice) => {
                    setInvoices([newInvoice, ...invoices]);
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
}
