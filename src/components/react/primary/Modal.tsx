import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // 1. Manejo de la tecla ESC para cerrar (UX Crítico)
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      // Evitamos el scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden'; 
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Si no está abierto, no renderizamos nada (o null)
  if (!isOpen) return null;

  // 2. Usamos createPortal para "teletransportar" el modal al body
  // Esto evita problemas de z-index y overflow del contenedor padre.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      {/* OVERLAY / BACKDROP 
         - bg-black/50: Oscurece el fondo
         - backdrop-blur-sm: El efecto borroso que pediste
         - transition-opacity: Suavidad visual
      */}
      <div 
        className="fixed inset-0 bg-primary-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
        aria-hidden="true"
      />

      {/* CONTENIDO DEL MODAL 
         - z-10: Para estar encima del backdrop
         - e.stopPropagation(): Evita que clicks dentro del modal lo cierren
      */}
      <div 
        ref={contentRef}
        className="relative z-10 w-full max-w-lg bg-primary-100 border-2 border-primary-300 rounded-md shadow-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header Opcional */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-primary-300">
            <h3 className="text-lg font-semibold text-primary-900">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-primary-700 hover:text-primary-900 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Body Dinámico (Children) */}
        <div className="px-6 py-6">
          {children}
        </div>
      </div>
    </div>,
    document.body // El destino del Portal
  );
};