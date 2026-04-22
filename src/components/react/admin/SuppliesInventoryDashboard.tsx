import { useState, useEffect } from 'react';
import { FaBox, FaBoxesStacked, FaStethoscope, FaClipboardList } from 'react-icons/fa6';
import { StatsCard } from '@/components/react/primary/StatsCard';
import { Field } from '@/components/react/primary/Field';
import { Select } from '@/components/react/primary/Select';
import SuppliesInventoryTable from './SuppliesInventoryTable';
import CreateProductModalTrigger from './CreateProductModalTrigger';
import type { InventoryItem } from '@/types/Inventory';
import { deleteAdminSupply, listAdminServices, listAdminSupplies } from '@/lib/services/admin/admin.service';

const TYPES = [
    { value: 'TODOS', label: 'Todos los tipos' },
    { value: 'INSUMO', label: 'Insumo' },
    { value: 'SERVICIO', label: 'Servicio' }
];

export default function SuppliesInventoryDashboard() {
    const forcedType = (() => {
        if (typeof window === "undefined") return null;
        const path = window.location.pathname;
        if (path.includes("/modules/admin/manage-services")) return "SERVICIO";
        if (path.includes("/modules/admin/manage-supplies")) return "INSUMO";
        return null;
    })();

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>(forcedType ?? 'TODOS');
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (forcedType) setTypeFilter(forcedType);
    }, [forcedType]);

    // Control de rebote para evitar recargas constantes y parpadeos
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const reloadSupplies = async () => {
        setIsLoading(true);
        try {
            const data = forcedType === "SERVICIO"
                ? await listAdminServices()
                : await listAdminSupplies();
            setItems(data);
        } catch {
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void reloadSupplies();
    }, []);

    const filtered = items.filter((item) => {
        const byType = typeFilter === 'TODOS' ? true : item.type === typeFilter;
        const bySearch = debouncedSearch.trim().length === 0
            ? true
            : item.name.toLowerCase().includes(debouncedSearch.toLowerCase());
        return byType && bySearch;
    });

    const scopedItems = forcedType ? items.filter((item) => item.type === forcedType) : items;
    const supplies = scopedItems.filter((item) => item.type === "INSUMO");
    const services = scopedItems.filter((item) => item.type === "SERVICIO");

    const criticalSupplies = supplies.filter((item) => (item.stock ?? 0) <= (item.minStock ?? 0)).length;
    const outOfStockSupplies = supplies.filter((item) => (item.stock ?? 0) <= 0).length;
    const totalStock = supplies.reduce((sum, item) => sum + (item.stock ?? 0), 0);

    const activeServices = services.filter((item) => item.status === "ACTIVO").length;
    const inactiveServices = services.filter((item) => item.status === "INACTIVO").length;
    const averageServicePrice = services.length > 0
        ? services.reduce((sum, item) => sum + (item.price ?? 0), 0) / services.length
        : 0;

    const money = (value: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

    const handleDelete = async (id: number) => {
        await deleteAdminSupply(id);
        await reloadSupplies();
    };

    return (
        <div className="space-y-6">
            {/* Tarjetas de Estadísticas superiores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {forcedType === "INSUMO" ? (
                    <>
                        <StatsCard title="Total Insumos" value={supplies.length} color="primary" icon={<FaBoxesStacked size={18} />} variant="compact" />
                        <StatsCard title="Insumos Críticos" value={criticalSupplies} color="danger" icon={<FaClipboardList size={18} />} variant="compact" />
                        <StatsCard title="Sin Stock" value={outOfStockSupplies} color="warning" icon={<FaBox size={18} />} variant="compact" />
                        <StatsCard title="Stock Total" value={totalStock} color="primary" icon={<FaBoxesStacked size={18} />} variant="compact" />
                    </>
                ) : forcedType === "SERVICIO" ? (
                    <>
                        <StatsCard title="Total Servicios" value={services.length} color="primary" icon={<FaStethoscope size={18} />} variant="compact" />
                        <StatsCard title="Servicios Activos" value={activeServices} color="success" icon={<FaStethoscope size={18} />} variant="compact" />
                        <StatsCard title="Servicios Inactivos" value={inactiveServices} color="danger" icon={<FaClipboardList size={18} />} variant="compact" />
                        <StatsCard title="Precio Promedio" value={money(averageServicePrice)} color="primary" icon={<FaBox size={18} />} variant="compact" />
                    </>
                ) : (
                    <>
                        <StatsCard title="Total Artículos" value={items.length} color="primary" icon={<FaBoxesStacked size={18} />} variant="compact" />
                        <StatsCard title="Insumos Críticos" value={items.filter((item) => (item.stock ?? 0) <= (item.minStock ?? 0)).length} color="danger" icon={<FaClipboardList size={18} />} variant="compact" />
                        <StatsCard title="Servicios Activos" value={items.filter((item) => item.type === 'SERVICIO' && item.status === 'ACTIVO').length} color="success" icon={<FaStethoscope size={18} />} variant="compact" />
                        <StatsCard title="Stock Total" value={items.reduce((sum, item) => sum + (item.stock ?? 0), 0)} color="primary" icon={<FaBox size={18} />} variant="compact" />
                    </>
                )}
            </div>

            {/* Contenedor Principal Azul (bg-primary-700) */}
            <section className="bg-primary-700 rounded-lg border border-primary-400 overflow-hidden shadow-xl">
                
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 shrink-0 rounded-lg bg-white/10 flex items-center justify-center">
                            <FaBox size={18} className="text-white" />
                        </div>
                        <div className='min-w-0'>
                            <h2 className="text-base font-semibold text-white leading-tight">
                                {forcedType === "INSUMO" ? "Gestión de Insumos" : forcedType === "SERVICIO" ? "Gestión de Servicios" : "Gestión de Insumos y Servicios"}
                            </h2>
                            <p className="text-xs text-primary-200 mt-0.5">
                                {forcedType === "INSUMO"
                                    ? "Inventario de la clínica: precios y stock."
                                    : forcedType === "SERVICIO"
                                        ? "Catálogo de servicios de la clínica: precio y disponibilidad."
                                        : "Inventario de la clínica: precios, stock y disponibilidad."}
                            </p>
                        </div>
                    </div>
                    <div className='shrink-0'>
                        <CreateProductModalTrigger
                            onCreated={reloadSupplies}
                            defaultType={forcedType ?? undefined}
                            lockType={Boolean(forcedType)}
                        />
                    </div>
                </div>

                {/* Barra de Filtros con corrección de parpadeo negro */}
                <div className="px-6 py-3 flex flex-wrap gap-3 items-center bg-white/5 border-b border-primary-400/30">
                    <div className="relative flex-1 min-w-50 max-w-sm">
                        <Field
                            name='search'
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            /* Forzamos la eliminación del contorno negro del navegador */
                            className="outline-none! ring-0! border-transparent! focus:outline-none! focus:ring-0! focus:border-transparent!"
                        />
                    </div>
                    {!forcedType && (
                        <div className="relative min-w-45">
                            <Select
                                value={typeFilter}
                                onChange={value => setTypeFilter(value as string)}
                                options={TYPES}
                            />
                        </div>
                    )}
                </div>

                <SuppliesInventoryTable
                    items={filtered}
                    isLoading={isLoading}
                    onDeleted={handleDelete}
                    onUpdated={reloadSupplies}
                />
            </section>
        </div>
    );
}