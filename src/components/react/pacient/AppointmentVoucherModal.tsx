import { useEffect } from 'react';
import { FaXmark, FaUserDoctor, FaCalendarDay, FaRegClock, FaPrint, FaCircleCheck, FaUser } from 'react-icons/fa6';
import { Button, ButtonTheme } from '@/components/react/primary/Button';

interface AppointmentVoucherModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointmentData: {
        patientName: string;
        doctorName: string;
        specialty: string;
        date: string;
        time: string;
        price: number | string;
    } | null;
}

export default function AppointmentVoucherModal({ isOpen, onClose, appointmentData }: AppointmentVoucherModalProps) {
    
    if (!isOpen || !appointmentData) return null;

    const handlePrint = () => {
        window.print();
    };

    const safePrice = Number(appointmentData.price || 0).toFixed(2);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in print:bg-transparent print:backdrop-blur-none print:p-0">
            
            {/* ESTILOS PARA IMPRESIÓN REPARADOS */}
            <style>{`
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                        background: white;
                    }
                    body * {
                        visibility: hidden;
                    }
                    /* Forzamos a la tarjeta a irse a la esquina superior izquierda sin trucos de transform que rompen el papel */
                    #printable-voucher {
                        visibility: visible;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        margin: 0 !important;
                        transform: none !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        border: none !important;
                        box-shadow: none !important;
                        padding: 2cm !important; /* Espacio para que no quede pegado al borde del papel */
                    }
                    #printable-voucher * {
                        visibility: visible;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
                @keyframes scale-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-scale-up { animation: scale-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>

            <div id="printable-voucher" className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up border border-slate-100">
                
                {/* Header del Comprobante */}
                <div className="bg-emerald-600 p-6 text-white text-center">
                    <FaCircleCheck className="w-12 h-12 mx-auto mb-3 text-emerald-100" />
                    <h3 className="font-bold text-2xl">¡Cita Agendada!</h3>
                    <p className="text-emerald-100 text-sm mt-1">Por favor presenta este comprobante en caja.</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Información del Paciente */}
                    <div className="border-b border-dashed border-slate-200 pb-4">
                        <span className="block text-slate-500 text-xs mb-1 uppercase tracking-wider font-semibold">Datos del Paciente</span>
                        <p className="font-bold text-slate-800 flex items-center gap-2">
                            <FaUser className="text-slate-400" /> {appointmentData.patientName || 'Paciente No Especificado'}
                        </p>
                    </div>

                    {/* Resumen de la Cita */}
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                        <div>
                            <span className="block text-slate-500 text-xs mb-1">Especialidad</span>
                            <p className="font-medium text-slate-900 flex items-center gap-1.5"><FaUserDoctor className="text-slate-400"/> {appointmentData.specialty || '-'}</p>
                        </div>
                        <div>
                            <span className="block text-slate-500 text-xs mb-1">Doctor</span>
                            <p className="font-medium text-slate-900">{appointmentData.doctorName || 'No asignado'}</p>
                        </div>
                        <div>
                            <span className="block text-slate-500 text-xs mb-1">Fecha</span>
                            <p className="font-medium text-slate-900 flex items-center gap-1.5"><FaCalendarDay className="text-slate-400"/> {appointmentData.date || '-'}</p>
                        </div>
                        <div>
                            <span className="block text-slate-500 text-xs mb-1">Hora</span>
                            <p className="font-medium text-slate-900 flex items-center gap-1.5"><FaRegClock className="text-slate-400"/> {appointmentData.time || '-'}</p>
                        </div>
                    </div>

                    {/* Total a pagar */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex justify-between items-center mt-2">
                        <span className="font-bold text-slate-700">Monto a cancelar en caja:</span>
                        <span className="text-2xl font-black text-emerald-600">${safePrice}</span>
                    </div>
                </div>

                {/* Footer / Botones (Se ocultan al imprimir) */}
                <div className="p-4 bg-slate-50 flex gap-3 justify-end border-t border-slate-100 no-print">
                    <Button 
                        label="Cerrar" 
                        variant={ButtonTheme.SECONDARY} 
                        onClick={onClose} 
                    />
                    <Button 
                        label="Imprimir Comprobante" 
                        variant={ButtonTheme.PRIMARY} 
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
                    />
                </div>
            </div>
        </div>
    );
}