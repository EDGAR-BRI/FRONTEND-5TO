import { useState } from 'react';
import { FaXmark, FaUserDoctor, FaCalendarDay, FaRegClock, FaMoneyBillWave, FaMobileScreen, FaBuildingColumns } from 'react-icons/fa6';
import { Button, ButtonTheme } from '@/components/react/primary/Button';

interface PaymentConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (paymentMethod: string, reference?: string) => void;
    appointmentData: {
        doctorName: string;
        specialty: string;
        date: string;
        time: string;
        price: number;
    } | null;
}

export default function PaymentConfirmationModal({ isOpen, onClose, onConfirm, appointmentData }: PaymentConfirmationModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<'pago_movil' | 'transferencia' | 'caja'>('pago_movil');
    const [reference, setReference] = useState('');

    if (!isOpen || !appointmentData) return null;

    const handleConfirm = () => {
        onConfirm(paymentMethod, reference);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="bg-primary-700 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        Confirmación de Cita
                    </h3>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <FaXmark size={20} />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {/* Resumen de la Cita */}
                    <div className="bg-primary-50 rounded-xl p-4 border border-primary-100 space-y-3">
                        <h4 className="text-sm font-semibold text-primary-900 border-b border-primary-200 pb-2">Resumen de tu consulta</h4>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="block text-primary-500 text-xs mb-0.5">Especialidad</span>
                                <p className="font-medium text-primary-900 flex items-center gap-1.5"><FaUserDoctor className="text-primary-400"/> {appointmentData.specialty}</p>
                            </div>
                            <div>
                                <span className="block text-primary-500 text-xs mb-0.5">Doctor</span>
                                <p className="font-medium text-primary-900 truncate">{appointmentData.doctorName}</p>
                            </div>
                            <div>
                                <span className="block text-primary-500 text-xs mb-0.5">Fecha</span>
                                <p className="font-medium text-primary-900 flex items-center gap-1.5"><FaCalendarDay className="text-primary-400"/> {appointmentData.date}</p>
                            </div>
                            <div>
                                <span className="block text-primary-500 text-xs mb-0.5">Hora</span>
                                <p className="font-medium text-primary-900 flex items-center gap-1.5"><FaRegClock className="text-primary-400"/> {appointmentData.time}</p>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-primary-200 flex justify-between items-center">
                            <span className="font-semibold text-primary-800">Total a pagar:</span>
                            <span className="text-xl font-bold text-emerald-600">${appointmentData.price.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Métodos de Pago */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-primary-900">Método de pago</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <button 
                                onClick={() => setPaymentMethod('pago_movil')}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border text-xs font-medium transition-colors ${paymentMethod === 'pago_movil' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                            >
                                <FaMobileScreen size={18} className={paymentMethod === 'pago_movil' ? 'text-primary-500' : ''} />
                                Pago Móvil
                            </button>
                            <button 
                                onClick={() => setPaymentMethod('transferencia')}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border text-xs font-medium transition-colors ${paymentMethod === 'transferencia' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                            >
                                <FaBuildingColumns size={18} className={paymentMethod === 'transferencia' ? 'text-primary-500' : ''} />
                                Transferencia
                            </button>
                            <button 
                                onClick={() => setPaymentMethod('caja')}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border text-xs font-medium transition-colors ${paymentMethod === 'caja' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                            >
                                <FaMoneyBillWave size={18} className={paymentMethod === 'caja' ? 'text-primary-500' : ''} />
                                Pagar en Caja
                            </button>
                        </div>

                        {/* Campos extra según el método (opcional, para que anoten la referencia de una vez) */}
                        {(paymentMethod === 'pago_movil' || paymentMethod === 'transferencia') && (
                            <div className="mt-4 animate-fade-in space-y-2">
                                <p className="text-xs text-gray-500">
                                    Por favor, realiza tu pago al <strong className="text-gray-700">0414-1234567 / V-12345678 / Banco XYZ</strong> y coloca la referencia abajo.
                                </p>
                                <input 
                                    type="text" 
                                    placeholder="Nro. de Referencia (Últimos 6 dígitos)" 
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 p-2 border"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="p-4 bg-gray-50 flex gap-3 justify-end border-t border-gray-100">
                    <Button 
                        label="Cancelar" 
                        variant={ButtonTheme.SECONDARY} 
                        onClick={onClose} 
                    />
                    <Button 
                        label="Confirmar y Agendar" 
                        variant={ButtonTheme.PRIMARY} 
                        onClick={handleConfirm}
                        disabled={(paymentMethod !== 'caja' && reference.length < 4)} // Pequeña validación
                    />
                </div>
            </div>
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-up { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
}