import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/react/primary/Modal';
import { Button } from '@/components/react/primary/Button';
import { Field } from '@/components/react/primary/Field';
import { Select } from '@/components/react/primary/Select';
import { SearchableSelect } from '@/components/react/primary/SearchableSelect';
import { getScheduleOverview } from '@/lib/services/scheduling/appointment/appointment.service';
import { getPaymentMethods } from '@/lib/services/finance/payment-method/payment_method.service';
import { getExchangeRates } from '@/lib/services/finance/exchange-rate/exchange_rate.service';
import { addInvoice } from '@/lib/services/finance/invoice/invoice.service';
import { updateAppointment } from '@/lib/services/scheduling/appointment/appointment.service';
import type { AppointmentsOverview } from '@/lib/services/scheduling/appointment/appointment.interface';
import type { PaymentMethod } from '@/lib/services/finance/payment-method/payment_method.interface';
import type { ExchangeRate } from '@/lib/services/finance/exchange-rate/exchange_rate.interface';
import type { Invoice } from '@/lib/services/finance/invoice/invoice.interface';
import { Spinner } from '@/components/react/primary/Spinner';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    receptionistId: number;
    onSuccess: (invoice: Invoice) => void;
}

interface PaymentRow {
    paymentMethodId: number;
    amount_paid: number;
    igtf_amount: number;
}

export function CreateInvoiceModal({ isOpen, onClose, receptionistId, onSuccess }: Props) {
    const [appointments, setAppointments] = useState<AppointmentsOverview[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Form state
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | number>('');
    const [payments, setPayments] = useState<PaymentRow[]>([]);
    
    // New payment form
    const [newPaymentMethodId, setNewPaymentMethodId] = useState<string | number>('');
    const [newAmount, setNewAmount] = useState<string>('');

    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [apps, methods, rates] = await Promise.all([
                    getScheduleOverview({ range: 'month' }), 
                    getPaymentMethods(),
                    getExchangeRates()
                ]);
                setAppointments(apps);
                setPaymentMethods(methods.filter(m => m.is_active));
                const activeRate = rates.find(r => r.is_active) || rates[0];
                setExchangeRate(activeRate);
            } catch (error) {
                console.error('Error fetching invoice data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isOpen]);

    const selectedAppointment = useMemo(() => 
        appointments.find(a => a.id === Number(selectedAppointmentId)),
    [selectedAppointmentId, appointments]);

    const totalPaid = useMemo(() => 
        payments.reduce((acc, p) => acc + p.amount_paid, 0),
    [payments]);

    const remaining = selectedAppointment ? (selectedAppointment.price - totalPaid) : 0;

    const handleAddPayment = () => {
        const method = paymentMethods.find(m => m.id === Number(newPaymentMethodId));
        if (!method || !newAmount || isNaN(Number(newAmount))) return;

        const amount = Number(newAmount);
        let igtf = 0;

        // IGTF Calculation Logic
        const isCash = method.type.toLowerCase().includes('cash') || method.type.toLowerCase().includes('efectivo');
        const isUSD = method.currency.toLowerCase().includes('usd') || method.currency.toLowerCase().includes('dolar') || method.currency.toLowerCase().includes('dólar') || method.currency.includes('$');
        
        if (isCash && isUSD) {
            igtf = amount * 0.03;
        }

        setPayments([...payments, { paymentMethodId: method.id, amount_paid: amount, igtf_amount: igtf }]);
        setNewPaymentMethodId('');
        setNewAmount('');
    };

    const handleRemovePayment = (index: number) => {
        setPayments(payments.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!selectedAppointment || !exchangeRate) return;
        
        setSubmitting(true);
        setErrorMsg(null);
        try {
            const invoicePayload = {
                patientId: selectedAppointment.patient.id!,
                receptionistId,
                exchangeRateId: exchangeRate.id,
                appointmentId: selectedAppointment.id,
                payments: payments.map(p => ({
                    paymentMethodId: p.paymentMethodId,
                    amount_paid: p.amount_paid,
                    igtf_amount: p.igtf_amount
                }))
            };

            const invoice = await addInvoice(invoicePayload);
            
            // If fully paid (or at least attempt to update as requested)
            if (totalPaid >= selectedAppointment.price) {
                await updateAppointment(selectedAppointment.id, { typeId: 2 });
            }

            onSuccess(invoice);
        } catch (error: any) {
            console.error('Error creating invoice:', error);
            const msg = error instanceof Error ? error.message : 'Error desconocido';
            setErrorMsg(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const appointmentOptions = appointments.map(a => ({
        value: a.id,
        label: `${a.patient.name} - ${a.doctor.user.name} - ${new Date(a.date_time).toLocaleDateString()} ($${a.price})`
    }));

    const methodOptions = paymentMethods.map(m => ({
        value: m.id,
        label: `${m.name} (${m.currency.toUpperCase()})`
    }));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Nueva Factura" >
            {loading ? (
                <div className="flex justify-center p-12">
                    <Spinner className="h-10 w-10 text-primary-600" />
                </div>
            ) : (
                <div className="space-y-6">
                    {errorMsg && (
                        <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                            <span className="font-bold">⚠️ Error:</span> {errorMsg}
                        </div>
                    )}
                    <div className="grid grid-cols-1 gap-4">
                        <SearchableSelect
                            label="Seleccionar Cita"
                            options={appointmentOptions}
                            value={selectedAppointmentId}
                            onChange={(val) => setSelectedAppointmentId(val)}
                            placeholder="Buscar cita por paciente..."
                            name="appointment"
                        />
                    </div>

                    {selectedAppointment && (
                        <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-primary-700 font-medium">Monto Total Cita:</span>
                                <span className="text-primary-900 font-bold text-lg">${selectedAppointment.price}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-primary-600">Restante por pagar:</span>
                                <span className={`font-semibold ${remaining > 0 ? 'text-error' : 'text-success'}`}>
                                    ${remaining.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="border-t border-primary-200 pt-4">
                        <h3 className="text-primary-800 font-semibold mb-3">Pagos Adjuntos</h3>
                        
                        <div className="space-y-2 mb-4">
                            {payments.map((p, i) => {
                                const method = paymentMethods.find(m => m.id === p.paymentMethodId);
                                return (
                                    <div key={i} className="flex justify-between items-center bg-white p-2 rounded border border-primary-100 text-sm">
                                        <span>{method?.name} - <span className="font-semibold">${p.amount_paid}</span> {p.igtf_amount > 0 && <span className="text-xs text-primary-500">(IGTF: ${p.igtf_amount.toFixed(2)})</span>}</span>
                                        <button onClick={() => handleRemovePayment(i)} className="text-error hover:underline text-xs">Eliminar</button>
                                    </div>
                                );
                            })}
                            {payments.length === 0 && <p className="text-xs text-primary-500 italic text-center py-2">No hay pagos agregados.</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end bg-primary-50/50 p-3 rounded-lg border border-dashed border-primary-300">
                            <div className="md:col-span-1">
                                <Select
                                    label="Método"
                                    options={methodOptions}
                                    value={newPaymentMethodId}
                                    onChange={(val) => setNewPaymentMethodId(val)}
                                    placeholder="Seleccionar"
                                    name="method"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <Field
                                    label="Monto ($)"
                                    type="number"
                                    name="amount"
                                    value={newAmount}
                                    onChange={(e) => setNewAmount(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <Button 
                                label="Agregar" 
                                onClick={handleAddPayment} 
                                variant="secondary" 
                                className="w-full"
                                disabled={!newAmount || !newPaymentMethodId}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-primary-200">
                        <Button label="Cancelar" onClick={onClose} variant="secondary" />
                        <Button 
                            label={submitting ? "Procesando..." : "Registrar Factura"} 
                            onClick={handleSubmit} 
                            variant="primary" 
                            disabled={submitting || !selectedAppointmentId || payments.length === 0}
                        />
                    </div>
                </div>
            )}
        </Modal>
    );
}
