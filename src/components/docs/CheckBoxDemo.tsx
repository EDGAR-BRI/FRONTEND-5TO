import { useState } from 'react';
import { CheckBox } from '@/components/react/primary/CheckBox';
import PreviewBox from './PreviewBox';

export default function CheckBoxDemo() {
  const [checks, setChecks] = useState({
    email: false,
    sms: true,
    push: false,
  });
  const [switches, setSwitches] = useState({
    activo: true,
    guardias: false,
  });

  return (
    <div className="not-content space-y-4">
      <PreviewBox label="Variante checkbox" className="flex-col items-start gap-3">
        <CheckBox
          label="Recibir notificaciones por email"
          name="email"
          checked={checks.email}
          onChange={(e) => setChecks(p => ({ ...p, email: e.target.checked }))}
        />
        <CheckBox
          label="Recibir notificaciones por SMS"
          name="sms"
          checked={checks.sms}
          onChange={(e) => setChecks(p => ({ ...p, sms: e.target.checked }))}
        />
        <CheckBox
          label="Recibir notificaciones push"
          name="push"
          checked={checks.push}
          onChange={(e) => setChecks(p => ({ ...p, push: e.target.checked }))}
        />
      </PreviewBox>

      <PreviewBox label="Variante switch" className="flex-col items-start gap-4">
        <CheckBox
          label="Doctor activo en el sistema"
          variant="switch"
          name="activo"
          checked={switches.activo}
          onChange={(e) => setSwitches(p => ({ ...p, activo: e.target.checked }))}
        />
        <CheckBox
          label="Disponible para guardias nocturnas"
          variant="switch"
          name="guardias"
          checked={switches.guardias}
          onChange={(e) => setSwitches(p => ({ ...p, guardias: e.target.checked }))}
        />
      </PreviewBox>
    </div>
  );
}
