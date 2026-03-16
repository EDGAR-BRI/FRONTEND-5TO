import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Wallet } from 'lucide-react';
import { BillDetailModal } from './BillDetailModal';
import StaticCard from '@/components/react/primary/StaticCard';

export const PaymentsBills = () => {
  const [selectedBill, setSelectedBill] = useState<any | null>(null);

  const payments = [
    { id: '8820', servicio: 'Consulta Especializada - Cardiología', fecha: '15 de Febrero, 2024', monto: '$60.00' },
    { id: '8821', servicio: 'Consulta Especializada - Cardiología', fecha: '15 de Febrero, 2024', monto: '$60.00' }
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-lg font-bold text-slate-800">Historial de Pagos</h3>
      </div>

      <div className="space-y-3">
        {payments.length > 0 ? (
          payments.map((pago, i) => (
            <StaticCard
              key={i}
              className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white p-4 rounded-2xl text-purple-500 shadow-sm">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 tracking-tight">{pago.servicio}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{pago.fecha} • Factura #{pago.id}</p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6">
                <div className="text-right">
                  <p className="text-sm font-black text-slate-800">{pago.monto}</p>
                  <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 mt-1">
                    <CheckCircle2 className="w-3 h-3" /> Pagado
                  </div>
                </div>

                <button
                  onClick={() => setSelectedBill(pago)}
                  className="bg-white text-blue-600 text-xs font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-all shadow-sm"
                >
                  Ver Detalles
                </button>
              </div>
            </StaticCard>
          ))
        ) : (
          /* ESTADO VACÍO */
          <StaticCard className="p-12 text-center flex flex-col items-center gap-4 border-dashed">
            <div className="bg-white p-6 rounded-full text-slate-300 shadow-sm">
              <Wallet className="w-12 h-12" />
            </div>
            <div className="max-w-xs">
              <p className="text-slate-800 font-bold text-lg">No hay pagos registrados</p>
              <p className="text-slate-400 text-xs mt-1">Aquí aparecerá el historial de sus facturas.</p>
            </div>
          </StaticCard>
        )}
      </div>

      <BillDetailModal
        isOpen={selectedBill !== null}
        onClose={() => setSelectedBill(null)}
        bill={selectedBill}
      />
    </div>
  );
};