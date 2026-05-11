import { useState } from "react";
import { ModalTrigger } from "@/components/react/primary/ModalTrigger";
import { Field } from "@/components/react/primary/Field";
import { Button, ButtonTheme } from "@/components/react/primary/Button";
import { createMedicalSpecialty } from "@/lib/services/medical/specialty/medicalSpecialty.service";
import { Alert } from "@/utils/alerts";

export default function CreateSpecialtyModalTrigger({ onCreated }: { onCreated?: () => void }) {
    const [name, setName] = useState("");
    const [consultationPrice, setConsultationPrice] = useState("");
    const [commissionPercentage, setCommissionPercentage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetForm = () => {
        setName("");
        setConsultationPrice("");
        setCommissionPercentage("");
        setError(null);
    };

    return (
        <ModalTrigger buttonLabel="Agregar especialidad" buttonTheme={ButtonTheme.PRIMARY} modalTitle="Crear nueva especialidad médica">
            {({ close }) => (
                <form
                    className="space-y-4"
                    onSubmit={async (event) => {
                        event.preventDefault();
                        setError(null);
                        setLoading(true);

                        const price = parseFloat(consultationPrice);
                        const commission = parseFloat(commissionPercentage);

                        if (isNaN(price) || price <= 0) {
                            setError("El precio de consulta debe ser mayor a 0");
                            setLoading(false);
                            return;
                        }

                        if (isNaN(commission) || commission < 0 || commission > 100) {
                            setError("El porcentaje de comisión debe estar entre 0 y 100");
                            setLoading(false);
                            return;
                        }

                        try {
                            await createMedicalSpecialty({
                                name,
                                consultation_price: price,
                                commission_percentage: commission,
                            });
                            resetForm();
                            close();
                            await Alert.success("Guardado", "Especialidad creada correctamente");
                            onCreated?.();
                        } catch (err) {
                            setError(err instanceof Error ? err.message : "No se pudo crear la especialidad");
                        } finally {
                            setLoading(false);
                        }
                    }}
                >
                    {error ? (
                        <div className="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">{error}</div>
                    ) : null}

                    <Field
                        label="Nombre de la especialidad"
                        name="name"
                        placeholder="Ej: Cardiología, Dermatología..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        minLength={2}
                        maxLength={120}
                    />

                    <Field
                        label="Precio de consulta (USD)"
                        name="consultation_price"
                        type="number"
                        placeholder="Ej: 50.00"
                        value={consultationPrice}
                        onChange={(e) => setConsultationPrice(e.target.value)}
                        required
                        min={0}
                        step="0.01"
                    />

                    <Field
                        label="Porcentaje de comisión (%)"
                        name="commission_percentage"
                        type="number"
                        placeholder="Ej: 30"
                        value={commissionPercentage}
                        onChange={(e) => setCommissionPercentage(e.target.value)}
                        required
                        min={0}
                        max={100}
                        step="0.01"
                    />

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button
                            label="Cancelar"
                            variant={ButtonTheme.SECONDARY}
                            type="button"
                            onClick={() => {
                                resetForm();
                                close();
                            }}
                        />
                        <Button label="Guardar" type="submit" loading={loading} />
                    </div>
                </form>
            )}
        </ModalTrigger>
    );
}