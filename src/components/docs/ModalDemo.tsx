import { ModalTrigger } from '@/components/react/primary/ModalTrigger';
import { Button } from '@/components/react/primary/Button';
import { Field } from '@/components/react/primary/Field';
import PreviewBox from './PreviewBox';

export default function ModalDemo() {
  return (
    <div className="not-content space-y-4">
      <PreviewBox label="Modal simple con título">
        <ModalTrigger buttonLabel="Abrir modal" modalTitle="Información del paciente">
          <div className="space-y-2 text-sm text-primary-900">
            <p><span className="font-semibold">Nombre:</span> Juan Pérez</p>
            <p><span className="font-semibold">Edad:</span> 34 años</p>
            <p><span className="font-semibold">Sangre:</span> O+</p>
          </div>
        </ModalTrigger>
      </PreviewBox>

      <PreviewBox label="Modal con formulario y botón de cerrar desde adentro">
        <ModalTrigger
          buttonLabel="Nueva cita"
          buttonTheme="secondary"
          modalTitle="Agendar cita médica"
        >
          {({ close }) => (
            <div className="space-y-4">
              <Field name="paciente_demo" label="Paciente" placeholder="Buscar paciente..." value="" onChange={() => {}} />
              <Field name="fecha_demo" label="Fecha" type="date" useNativeDatePicker={false} value="" onChange={() => {}} />
              <div className="flex justify-end gap-2 pt-2">
                <Button label="Cancelar" variant="secondary" onClick={close} />
                <Button label="Guardar cita" onClick={close} />
              </div>
            </div>
          )}
        </ModalTrigger>
      </PreviewBox>

      <PreviewBox label="Modal de confirmación peligrosa">
        <ModalTrigger
          buttonLabel="Eliminar doctor"
          buttonTheme="danger-ghost"
          modalTitle="¿Confirmar eliminación?"
        >
          {({ close }) => (
            <div className="space-y-4">
              <p className="text-sm text-primary-900">
                Esta acción eliminará permanentemente al doctor del sistema. ¿Estás seguro?
              </p>
              <div className="flex justify-end gap-2">
                <Button label="Cancelar" variant="ghost" onClick={close} />
                <Button label="Eliminar" variant="danger-ghost" onClick={close} />
              </div>
            </div>
          )}
        </ModalTrigger>
      </PreviewBox>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Individual Demos for MDX
// ----------------------------------------------------------------------------

export function ModalSimpleDemo() {
  return (
    <ModalTrigger buttonLabel="Ver historial" modalTitle="Historial del paciente">
      <p className="text-sm text-primary-900">Aquí va el contenido del historial...</p>
    </ModalTrigger>
  );
}

export function ModalWithFormDemo() {
  return (
    <ModalTrigger buttonLabel="Nueva cita" buttonTheme="secondary" modalTitle="Agendar cita">
      {({ close }) => (
        <div className="space-y-4">
          <Field 
            name="fecha_doc" 
            label="Fecha" 
            type="date" 
            useNativeDatePicker={false} 
            value="" 
            onChange={() => {}} 
          />
          <div className="flex justify-end gap-2">
            <Button label="Cancelar" variant="secondary" onClick={close} />
            <Button label="Guardar" onClick={close} />
          </div>
        </div>
      )}
    </ModalTrigger>
  );
}

export function ModalConfirmDemo() {
  return (
    <ModalTrigger buttonLabel="Eliminar doctor" buttonTheme="danger-ghost" modalTitle="¿Confirmar eliminación?">
      {({ close }) => (
        <div className="space-y-4">
          <p className="text-sm text-primary-900">Esta acción es irreversible. ¿Estás seguro?</p>
          <div className="flex justify-end gap-2">
            <Button label="Cancelar" variant="ghost" onClick={close} />
            <Button label="Sí, eliminar" variant="danger-ghost" onClick={close} />
          </div>
        </div>
      )}
    </ModalTrigger>
  );
}
