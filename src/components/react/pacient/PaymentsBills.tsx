import { useState, useEffect } from 'react';
import { FaWallet, FaCircleCheck, FaCircleExclamation, FaClock } from 'react-icons/fa6';
import { BillDetailModal } from './BillDetailModal';
import StaticCard from '@/components/react/primary/StaticCard';
import { api } from '@/lib/api';
import { Spinner } from '@/components/react/primary/Spinner';

export const PaymentsBills = ({ patientId }: { patientId: string }) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const res = await api(`/finance/invoice/patient/${patientId}`);
        if (res.ok) {
          const json = await res.json();
          const arr = Array.isArray(json.data) ? json.data : [];
          setInvoices([...arr].sort((a, b) => new Date(b.date_at).getTime() - new Date(a.date_at).getTime()));
        } else {
          setInvoices([]);
        }
      } catch (error) {
        console.error('Error al traer facturas:', error);
        setInvoices([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [patientId]);

  if (isLoading) return (
    <StaticCard className="p-16 text-center flex flex-col items-center gap-4 border-dashed bg-white">
      <Spinner />
    </StaticCard>
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-lg font-bold text-slate-800">Historial de Pagos</h3>
      </div>

      <div className="space-y-4">
        {invoices.length > 0 ? (
          invoices.map((invoice: any, i: number) => (
            <BillDetailModal key={i} bill={invoice} />
          ))
        ) : (
          <StaticCard className="p-16 text-center flex flex-col items-center gap-4 border-dashed bg-white">
            <div className="bg-slate-50 p-6 rounded-full text-slate-300 shadow-sm border border-slate-100">
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