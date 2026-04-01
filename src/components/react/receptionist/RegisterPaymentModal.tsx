import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterPaymentModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all">
        
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-primary-800">Registrar Pago</h3>
            <p className="text-xs text-cool-gray-50 mt-1">Ingresa los detalles de la transacción actual</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-primary-600 transition-colors text-2xl p-2"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Formulario */}
        <form className="p-6 space-y-5" onSubmit={(e) => e.preventDefault()}>
          
          {/* Fila 1: Paciente (Ancho completo) */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-cool-gray-50 uppercase tracking-wider ml-1">
              Paciente
            </label>
            <div className="relative">
              <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input 
                type="text" 
                placeholder="Ej. Ana Sofía Parra" 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-sm text-slate-700"
              />
            </div>
          </div>

          {/* Fila 2: Monto y Moneda */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-cool-gray-50 uppercase tracking-wider ml-1">
                Monto
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">$</span>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00" 
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary-500 outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-cool-gray-50 uppercase tracking-wider ml-1">
                Moneda
              </label>
              <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-500 outline-none cursor-pointer appearance-none">
                <option value="USD">Dólares (USD)</option>
                <option value="VES">Bolívares (Bs.)</option>
              </select>
            </div>
          </div>

          {/* Fila 3: Método y Doctor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-cool-gray-50 uppercase tracking-wider ml-1">
                Método de Pago
              </label>
              <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-500 outline-none cursor-pointer">
                <option>Efectivo</option>
                <option>Transferencia</option>
                <option>Pago Móvil</option>
                <option>Zelle</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-cool-gray-50 uppercase tracking-wider ml-1">
                Médico
              </label>
              <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-500 outline-none cursor-pointer">
                <option>Seleccionar doctor...</option>
                <option>Dr. Carlos Méndez</option>
                <option>Dra. Luisa Vargas</option>
              </select>
            </div>
          </div>

          {/* Footer del Modal: Acciones */}
          <div className="pt-6 flex flex-col sm:flex-row gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-xl transition-all order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-[2] py-3 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all transform active:scale-95 flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              <i className="fa-solid fa-check-to-slot"></i>
              Confirmar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPaymentModal;