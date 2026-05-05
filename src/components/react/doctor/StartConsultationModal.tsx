import React, { useState } from 'react';

// Tipado estricto para las props
interface StartConsultationModalProps {
    isOpen: boolean;
    appointment: any | null; // Lo ideal es tipar la cita correctamente
    onClose: () => void;
    onStart: (invoiceCode: string) => void;
}

export const StartConsultationModal: React.FC<StartConsultationModalProps> = ({ 
    isOpen, 
    appointment, 
    onClose, 
    onStart 
}) => {
    const [invoiceCode, setInvoiceCode] = useState('');

    if (!isOpen || !appointment) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!invoiceCode.trim()) {
            alert("El código de factura es obligatorio para iniciar la consulta.");
            return;
        }
        onStart(invoiceCode);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                    Iniciar Consulta
                </h3>
                <p className="text-slate-500 text-sm mb-6">
                    Paciente: <strong className="text-slate-700">{appointment.patientName}</strong>
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="invoice" className="block text-sm font-semibold text-slate-700 mb-1">
                            Número de Factura / Código de Autorización
                        </label>
                        <input
                            id="invoice"
                            type="text"
                            value={invoiceCode}
                            onChange={(e) => setInvoiceCode(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            placeholder="Ej. FAC-2026-001"
                            autoFocus
                        />
                    </div>

                    <div className="flex gap-3 justify-end mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors"
                        >
                            Iniciar Consulta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};