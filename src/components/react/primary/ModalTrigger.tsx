import React, { type ReactNode } from 'react';
import { Modal } from './Modal';
import { Button, ButtonTheme, type variant } from './Button';
import { useModal } from 'src/hooks/UseModal';

interface ModalTriggerProps {
  buttonLabel?: string;
  modalTitle: string;
  buttonTheme?: variant;
  children: ReactNode | ((props: { close: () => void }) => ReactNode);
  trigger?: ReactNode;
}

export const ModalTrigger = ({
  buttonLabel = "Open Check definition",
  modalTitle,
  buttonTheme = ButtonTheme.PRIMARY,
  children,
  trigger
}: ModalTriggerProps) => {

  const { isOpen, openModal, closeModal } = useModal();

  return (
    <>
      {trigger ? (
        <div onClick={openModal} className="cursor-pointer contents">
          {trigger}
        </div>
      ) : (
        <Button
          label={buttonLabel}
          variant={buttonTheme}
          onClick={openModal}
        />
      )}

      <Modal isOpen={isOpen} onClose={closeModal} title={modalTitle}>
        {typeof children === 'function'
          ? children({ close: closeModal })
          : children
        }
      </Modal>
    </>
  );
};