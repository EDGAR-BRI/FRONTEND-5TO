import React, { useState } from 'react';
import { Modal } from '@/components/react/primary/Modal';
import { Field } from '@/components/react/primary/Field';
import { Select } from '@/components/react/primary/Select';
import { Button } from '@/components/react/primary/Button';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const AddTransactionModal = ({ isOpen, onClose, onSuccess }: AddTransactionModalProps) => {
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        date: '',
        type: 'expense',
        category: '',
        status: 'completed'
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Simular petición
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("Transacción guardada:", formData);
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const transactionTypes = [
        { label: 'Ingreso', value: 'income' },
        { label: 'Gasto', value: 'expense' },
    ];

    const categories = [
        { label: 'Consulta', value: 'Consulta' },
        { label: 'Tratamiento', value: 'Tratamiento' },
        { label: 'Insumos', value: 'Insumos' },
        { label: 'Servicios', value: 'Servicios' },
        { label: 'Mantenimiento', value: 'Mantenimiento' },
        { label: 'Salarios', value: 'Salarios' },
        { label: 'Otros', value: 'Otros' },
    ];
    
    const statuses = [
        { label: 'Completado', value: 'completed' },
        { label: 'Pendiente', value: 'pending' },
        { label: 'Cancelado', value: 'cancelled' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nueva Transacción">
            <form onSubmit={handleSubmit} className="space-y-4 min-w-[400px]">
                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Tipo"
                        name="type"
                        options={transactionTypes}
                        value={formData.type}
                        onChange={(val) => handleSelectChange('type', val)}
                        required
                    />
                    <Select
                        label="Estado"
                        name="status"
                        options={statuses}
                        value={formData.status}
                        onChange={(val) => handleSelectChange('status', val)}
                        required
                    />
                </div>

                <Field 
                    label="Descripción" 
                    name="description" 
                    placeholder="Ej: Pago de luz" 
                    value={formData.description}
                    onChange={handleChange}
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <Field 
                        label="Monto" 
                        name="amount" 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        value={formData.amount}
                        onChange={handleChange}
                        required
                    />
                     <Field 
                        label="Fecha" 
                        name="date" 
                        type="date" 
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <Select
                    label="Categoría"
                    name="category"
                    options={categories}
                    value={formData.category}
                    onChange={(val) => handleSelectChange('category', val)}
                    required
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        label="Cancelar" 
                        onClick={onClose} 
                    />
                    <Button 
                        type="submit" 
                        variant="primary" 
                        label="Guardar" 
                        loading={loading}
                    />
                </div>
            </form>
        </Modal>
    );
};
