import { FaWallet } from 'react-icons/fa6';
import { BillDetailModal } from './BillDetailModal';
import StaticCard from '@/components/react/primary/StaticCard';

export const PaymentsBills = ({ patientId }: { patientId: string }) => {
  const payments: any[] = [];

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
              <FaWallet className="w-12 h-12" />
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