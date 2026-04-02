import { useState } from 'react';
import RegisterPaymentModal from '@/components/react/receptionist/RegisterPaymentModal'; 

export default function PaymentAction() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-600 text-white text-button-s font-semibold hover:bg-primary-700 transition-colors shadow-sm cursor-pointer"
      >
        <i className="fa-solid fa-plus"></i>
        Registrar pago
      </button>

      <RegisterPaymentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}