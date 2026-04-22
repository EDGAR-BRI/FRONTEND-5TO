import { useState, useEffect } from "react";
import { ModalTrigger } from "@/components/react/primary/ModalTrigger";
import { Field } from "@/components/react/primary/Field";
import { Button, ButtonTheme } from "@/components/react/primary/Button";
import { updateExpenseCategory, type ExpenseCategoryDto } from "@/lib/services/finance/expense-category/expenseCategory.service";
import { FaPen } from "react-icons/fa6";

export default function EditExpenseCategoryModalTrigger({ category, onUpdated }: { category: ExpenseCategoryDto; onUpdated?: () => void }) {
    const [name, setName] = useState(category.name);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setName(category.name);
    }, [category]);

    return (
        <ModalTrigger 
            modalTitle="Editar servicio / categoría"
            trigger={
                <button className="flex items-center gap-1 text-xs py-1 px-2 rounded-lg font-medium text-primary-700 bg-primary-100 hover:bg-primary-200 transition-colors">
                    <FaPen size={10} />
                    Editar
                </button>
            }
        >
            {({ close }) => (
                <form
                    className="space-y-4"
                    onSubmit={async (event) => {
                        event.preventDefault();
                        setError(null);
                        setLoading(true);

                        try {
                            await updateExpenseCategory(category.id, { name });
                            close();
                            onUpdated?.();
                        } catch (err) {
                            setError(err instanceof Error ? err.message : "No se pudo actualizar el servicio");
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
                                setName(category.name);
                                setError(null);
                            }}
                        />
                        <Button label="Guardar cambios" type="submit" loading={loading} />
                    </div>
                </form>
            )}
        </ModalTrigger>
    );
}
