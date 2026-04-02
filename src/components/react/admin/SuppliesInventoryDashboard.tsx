import { useState, useEffect } from 'react';
import { FaBox, FaBoxesStacked, FaStethoscope, FaClipboardList } from 'react-icons/fa6';
import { StatsCard } from '@/components/react/primary/StatsCard';
import { Field } from '@/components/react/primary/Field';
import { Select } from '@/components/react/primary/Select';
import SuppliesInventoryTable from './SuppliesInventoryTable';
import CreateProductModalTrigger from './CreateProductModalTrigger';

const TYPES = [
    { value: 'TODOS', label: 'Todos los tipos' },
    { value: 'INSUMO', label: 'Insumo' },
    { value: 'SERVICIO', label: 'Servicio' }
];

export default function SuppliesInventoryDashboard() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('TODOS');

    // Control de rebote para evitar recargas constantes y parpadeos
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    return (
        <div className="space-y-6">
            {/* Tarjetas de Estadísticas superiores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Total Artículos" value={150} color="primary" icon={<FaBoxesStacked size={18} />} variant="compact" />
                <StatsCard title="Insumos Críticos" value={12} color="danger" icon={<FaClipboardList size={18} />} variant="compact" />
                <StatsCard title="Servicios Activos" value={45} color="success" icon={<FaStethoscope size={18} />} variant="compact" />
                <StatsCard title="Stock Total" value="2.4k" color="primary" icon={<FaBox size={18} />} variant="compact" />
            </div>

            {/* Contenedor Principal Azul (bg-primary-700) */}
            <section className="bg-primary-700 rounded-lg border border-primary-400 overflow-hidden shadow-xl">
                
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 shrink-0 rounded-lg bg-white/10 flex items-center justify-center">
                            <FaBox size={18} className="text-white" />
                        </div>
                        <div className='min-w-0'>
                            <h2 className="text-base font-semibold text-white leading-tight">Gestión de Insumos y Servicios</h2>
                            <p className="text-xs text-primary-200 mt-0.5">Inventario de la clínica: precios, stock y disponibilidad.</p>
                        </div>
                    </div>
                    <div className='shrink-0'>
                        <CreateProductModalTrigger />
                    </div>
                </div>

                {/* Barra de Filtros con corrección de parpadeo negro */}
                <div className="px-6 py-3 flex flex-wrap gap-3 items-center bg-white/5 border-b border-primary-400/30">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Field
                            name='search'
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            /* Forzamos la eliminación del contorno negro del navegador */
                            className="!outline-none !ring-0 !border-transparent focus:!outline-none focus:!ring-0 focus:!border-transparent"
                        />
                    </div>
                    <div className="relative min-w-[180px]">
                        <Select
                            value={typeFilter}
                            onChange={value => setTypeFilter(value as string)}
                            options={TYPES}
                        />
                    </div>
                </div>

                <SuppliesInventoryTable search={debouncedSearch} type={typeFilter} />
            </section>
        </div>
    );
}