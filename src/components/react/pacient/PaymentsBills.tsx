import React from 'react';
import { CreditCard, Wallet } from 'lucide-react';
import { BillDetailModal } from './BillDetailModal';
import StaticCard from '@/components/react/primary/StaticCard';

export const PaymentsBills = () => {
  const payments = [
    { id: '8820', servicio: 'Consulta Especializada - Cardiología', fecha: '15 de Febrero, 2024', monto: '$60.00' },
    { id: '8821', servicio: 'Consulta Especializada - Cardiología', fecha: '15 de Febrero, 2024', monto: '$60.00' }
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-lg font-bold text-slate-800">Historial de Pagos</h3>
      </div>

      <div className="space-y-4">
        {payments.length > 0 ? (
          payments.map((pago, i) => (
            <BillDetailModal key={i} bill={pago} />
          ))
        ) : (
          <StaticCard className="p-16 text-center flex flex-col items-center gap-4 border-dashed">
            <div className="bg-white p-6 rounded-full text-slate-300 shadow-sm">
              <Wallet className="w-12 h-12" />
            </div>
            <div className="max-w-xs text-center">
              <p className="text-slate-800 font-bold text-lg">No hay pagos registrados</p>
              <p className="text-slate-400 text-xs mt-1 text-balance">
                Aquí aparecerá el historial detallado de sus facturas y recibos.
              </p>
            </div>
          </StaticCard>
        )}
      </div>
    </div>
  );
};