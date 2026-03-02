import React from 'react';
import { X, CreditCard, Calendar, Hash, CheckCircle2, FileText } from 'lucide-react';

interface Bill {
  id: string;
  servicio: string;
  fecha: string;
  monto: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill | null;
}

export const BillDetailModal = ({ isOpen, onClose, bill }: Props) => {
  if (!isOpen || !bill) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        

        <div className="bg-[#0f172a] p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
          <div className="flex items-center gap-4">

            <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Comprobante de Pago</p>
              <h2 className="text-2xl font-bold">{bill.servicio}</h2>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">

          <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-700">Transacción Exitosa</span>
            </div>
            <span className="text-xs font-black text-emerald-600 uppercase tracking-tighter">Pagado</span>
          </div>


          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-wider">Fecha de Emisión</label>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-600 flex items-center gap-2 font-medium">
                <Calendar className="w-4 h-4 text-emerald-500" /> {bill.fecha}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-wider">Nº de Factura</label>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-600 flex items-center gap-2 font-medium">
                <Hash className="w-4 h-4 text-emerald-500" /> #{bill.id}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resumen de Cargo</span>
              <div className="flex items-center gap-1 text-slate-500">
                <CreditCard className="w-3 h-3" />
                <span className="text-[10px] font-medium">Tarjeta de Crédito</span>
              </div>
            </div>
            
            <div className="p-7 bg-slate-900 rounded-[2rem] flex justify-between items-center text-white shadow-xl shadow-slate-200/50">
              <span className="text-sm font-medium text-slate-400 tracking-tight">Total Pagado</span>
              <span className="text-3xl font-black text-emerald-400 tracking-tighter">{bill.monto}</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 text-white font-bold rounded-2xl transition-all text-sm bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 mt-2"
          >
            Cerrar Comprobante
          </button>
        </div>
      </div>
    </div>
  );
};