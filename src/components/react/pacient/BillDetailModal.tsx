import {
  FaFileLines,
  FaCreditCard,
  FaCircleCheck,
  FaCircleExclamation,
  FaCalendarDays,
  FaHashtag,
  FaReceipt,
} from 'react-icons/fa6';
import { ModalTrigger } from '../primary/ModalTrigger';
import { Button } from '../primary/Button';
import StaticCard from '../primary/StaticCard';

interface Bill {
  id: number;
  total_usd: string;
  total_bs: string;
  status?: {
    name: string;
    color_hex: string;
  };
  createdAt?: string;
}

export const BillDetailModal = ({ bill }: { bill: Bill }) => {
  const statusName = bill.status?.name || 'Pendiente';
  const isPaid = statusName.toLowerCase().includes('pagado') || statusName.toLowerCase().includes('cancelado');
  const isPending = statusName.toLowerCase().includes('pendiente');
  
  const createdAt = bill.createdAt ? new Date(bill.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
  const amount = bill.total_usd ? `$${bill.total_usd}` : '-';
  const amountBs = bill.total_bs ? `Bs ${bill.total_bs}` : '-';

  return (
    <StaticCard className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      
      <div className="flex items-center gap-4">
        <div className={`bg-white p-4 rounded-2xl shadow-sm border ${isPaid ? 'border-purple-50 text-purple-500' : 'border-amber-50 text-amber-500'}`}>
          <FaCreditCard className="w-6 h-6" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-slate-800 tracking-tight">Factura #{bill.id}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 italic">{createdAt}</p>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-8">
        <div className="text-right">
          <p className="text-sm font-black text-slate-800">{amount}</p>
          {isPaid ? (
            <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full mt-1 border border-emerald-200/50">
              <FaCircleCheck className="w-3 h-3" /> {statusName}
            </div>
          ) : isPending ? (
            <div className="flex items-center gap-1.5 text-amber-600 text-[10px] font-bold bg-amber-100 px-2.5 py-0.5 rounded-full mt-1 border border-amber-200/50">
              <FaCircleExclamation className="w-3 h-3" /> {statusName}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-600 text-[10px] font-bold bg-slate-100 px-2.5 py-0.5 rounded-full mt-1 border border-slate-200/50">
              {statusName}
            </div>
          )}
        </div>

        <ModalTrigger
          modalTitle="Detalle de Facturación"
          trigger={
            <button className="bg-white text-blue-600 text-xs font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-all shadow-sm border border-transparent">
              Ver Detalles
            </button>
          }
        >
          {({ close }) => (
            <div className="space-y-6">

              <div className={`flex items-center gap-4 p-6 rounded-2xl border ${isPaid ? 'bg-emerald-50 border-emerald-100' : isPending ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                <div className={`${isPaid ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : 'bg-slate-500'} p-3 rounded-xl shadow-lg`}>
                  <FaFileLines className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className={`${isPaid ? 'text-emerald-600' : isPending ? 'text-amber-600' : 'text-slate-600'} text-[10px] font-black uppercase tracking-widest`}>
                    {isPaid ? 'Pagada' : isPending ? 'Pendiente' : statusName}
                  </p>
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">Factura #{bill.id}</h2>
                </div>
              </div>

              <div className="space-y-5 text-left px-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Fecha</label>
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <FaCalendarDays className="w-4 h-4 text-blue-500" /> {createdAt}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Control</label>
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <FaHashtag className="w-4 h-4 text-blue-500" /> #{bill.id}00XVF
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Resumen del Cargo</label>
                  
                  <div className={`p-6 rounded-[2rem] flex justify-between items-center shadow-inner ${isPaid ? 'bg-emerald-50/70 border border-emerald-100 shadow-emerald-100/30' : 'bg-amber-50/70 border border-amber-100 shadow-amber-100/30'}`}>
                    
                    <div className="flex gap-4 items-center text-left">
                      <div className={`p-3.5 rounded-2xl border shadow-sm ${isPaid ? 'border-emerald-100 shadow-emerald-100/20 text-emerald-600 bg-white' : 'border-amber-100 shadow-amber-100/20 text-amber-600 bg-white'}`}>
                        <FaReceipt className="w-6 h-6" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">Total</span>
                        <span className="text-[10px] text-emerald-600 font-medium italic">Equivalente en Bs: {amountBs}</span>
                      </div>
                    </div>

                    <span className="text-4xl font-black text-slate-800 tracking-tighter">{amount}</span>
                  </div>
                </div>
              </div>


              <Button 
                label="Cerrar" 
                variant="primary" 
                onClick={close} 
                adaptive 
                className="h-12 text-sm font-bold shadow-lg" 
              />
            </div>
          )}
        </ModalTrigger>
      </div>
    </StaticCard>
  );
};