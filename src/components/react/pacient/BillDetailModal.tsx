import { FileText, CreditCard, CheckCircle2, Calendar, Hash, Receipt } from 'lucide-react';
import { ModalTrigger } from '../primary/ModalTrigger';
import { Button } from '../primary/Button';
import StaticCard from '../primary/StaticCard';

interface Bill {
  id: string;
  servicio: string;
  fecha: string;
  monto: string;
}

export const BillDetailModal = ({ bill }: { bill: Bill }) => {
  return (
    <StaticCard className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      
      <div className="flex items-center gap-4">
        <div className="bg-white p-4 rounded-2xl text-purple-500 shadow-sm border border-purple-50">
          <CreditCard className="w-6 h-6" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-slate-800 tracking-tight">{bill.servicio}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 italic">{bill.fecha} • Factura #{bill.id}</p>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-8">
        <div className="text-right">
          <p className="text-sm font-black text-slate-800">{bill.monto}</p>
          <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full mt-1 border border-emerald-200/50">
            <CheckCircle2 className="w-3 h-3" /> Pagado
          </div>
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

              <div className="flex items-center gap-4 bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                <div className="bg-emerald-500 p-3 rounded-xl shadow-lg shadow-emerald-500/20">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">Transacción Exitosa</p>
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">Factura #{bill.id}</h2>
                </div>
              </div>

              <div className="space-y-5 text-left px-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Fecha de Pago</label>
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-500" /> {bill.fecha}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Control / Hash</label>
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Hash className="w-4 h-4 text-blue-500" /> #{bill.id}00XVF
                    </p>
                  </div>
                </div>

                <div className="space-y-1 border-t border-slate-100 pt-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Concepto Facturado</label>
                  <p className="text-sm font-semibold text-slate-700 leading-snug">{bill.servicio}</p>
                </div>

                <div className="space-y-3 pt-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Resumen del Cargo</label>
                  
                 
                  <div className="p-6 bg-emerald-50/70 border border-emerald-100 rounded-[2rem] flex justify-between items-center shadow-inner shadow-emerald-100/30">
                    
                    {/* Detalles del Pago */}
                    <div className="flex gap-4 items-center text-left">
                      <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-100/20 text-emerald-600">
                        <Receipt className="w-6 h-6" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">Total Cancelado</span>
                        <span className="text-[10px] text-emerald-600 font-medium italic">IVA (16%) Incluido y Tasas Municipales</span>
                      </div>
                    </div>


                    <span className="text-4xl font-black text-emerald-600 tracking-tighter shadow-emerald-100">{bill.monto}</span>
                  </div>
                </div>
              </div>


              <Button 
                label="Cerrar Comprobante" 
                variant="primary" 
                onClick={close} 
                adaptive 
                className="h-12 text-sm font-bold shadow-lg shadow-emerald-100" 
              />
            </div>
          )}
        </ModalTrigger>
      </div>
    </StaticCard>
  );
};