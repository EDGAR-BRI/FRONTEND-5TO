import { useState } from "react";
import { ModalTrigger } from "@/components/react/primary/ModalTrigger";
import { Field } from "@/components/react/primary/Field";
import { Button, ButtonTheme } from "@/components/react/primary/Button";
import { createExpenseCategory } from "@/lib/services/finance/expense-category/expenseCategory.service";

export default function CreateExpenseCategoryModalTrigger({ onCreated }: { onCreated?: () => void }) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    return (
        <ModalTrigger buttonLabel="Agregar servicio" buttonTheme={ButtonTheme.PRIMARY} modalTitle="Crear nuevo servicio / categoría">
            {({ close }) => (
                <form
                    className="space-y-4"
                    onSubmit={async (event) => {
                        event.preventDefault();
                        setError(null);
                        setLoading(true);

                        try {
                            await createExpenseCategory({ name });
                            close();
                            setName("");
                            onCreated?.();
                        } catch (err) {
                            setError(err instanceof Error ? err.message : "No se pudo crear el servicio");
                        } finally {
                            setLoading(false);
                        }
                    }}
                >
                    {error ? (
                        <div className="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">{error}</div>
                    ) : null}

                    <Field 
                        label="Nombre del servicio" 
                        name="name" 
                        placeholder="Ej: Agua, Luz, Internet..." 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                    />

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button
                            label="Cancelar"
                            variant={ButtonTheme.SECONDARY}
                            type="button"
                            onClick={() => {
                                close();
                                setName("");
                                setError(null);
                            }}
                        />
                        <Button label="Guardar" type="submit" loading={loading} />
                    </div>
                </form>
            )}
        </ModalTrigger>
    );
}
