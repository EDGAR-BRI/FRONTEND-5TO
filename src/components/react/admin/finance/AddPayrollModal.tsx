import { useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { Modal } from '@/components/react/primary/Modal';
import { Field } from '@/components/react/primary/Field';
import { Select } from '@/components/react/primary/Select';
import { Button } from '@/components/react/primary/Button';

interface AddPayrollModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const AddPayrollModal = ({ isOpen, onClose, onSuccess }: AddPayrollModalProps) => {
    const [formData, setFormData] = useState<{
        employeeId: string;
        amount: string;
        date: string;
        description: string;
        status: string;
    }>({
        employeeId: '',
        amount: '',
        date: '',
        description: 'Pago de Quincena',
        status: 'completed'
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Simular petición
            await new Promise(resolve => setTimeout(resolve, 800));
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const employees = [
        { label: 'Dr. Roberto Mendoza', value: '1' },
        { label: 'Dra. Ana López', value: '2' },
        { label: 'Carlos Ruiz (Recepción)', value: '3' },
        { label: 'María Gómez (Enfermería)', value: '4' },
    ];
    
    const statuses = [
        { label: 'Pagado', value: 'completed' },
        { label: 'Pendiente', value: 'pending' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Pago de Nómina">
            <form onSubmit={handleSubmit} className="space-y-4 w-full">
                <Select
                    label="Empleado"
                    name="employeeId"
                    options={employees}
                    value={formData.employeeId}
                    onChange={(val) => handleSelectChange('employeeId', val)}
                    required
                />

                <Field 
                    label="Descripción del pago" 
                    name="description" 
                    placeholder="Ej: Quincena 1 Mayo" 
                    value={formData.description}
                    onChange={handleChange}
                    required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        label="Fecha de Pago" 
                        name="date" 
                        type="date" 
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <Select
                    label="Estado"
                    name="status"
                    options={statuses}
                    value={formData.status}
                    onChange={(val) => handleSelectChange('status', val)}
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
                        label="Registrar Pago" 
                        loading={loading}
                    />
                </div>
            </form>
        </Modal>
    );
};
