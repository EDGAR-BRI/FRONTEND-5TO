import { useState, useEffect, useMemo } from 'react';
import { FaBoxesStacked, FaFileInvoiceDollar, FaChartLine, FaWallet } from 'react-icons/fa6';
import { StatsCard } from '@/components/react/primary/StatsCard';
import { Field } from '@/components/react/primary/Field';
import ExpenseCategoryTable, { type CategoryWithStats } from './ExpenseCategoryTable';
import CreateExpenseCategoryModalTrigger from './CreateExpenseCategoryModalTrigger';
import { listExpenseCategories, deleteExpenseCategory, listInvoiceExpenses } from '@/lib/services/finance/expense-category/expenseCategory.service';

const money = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export default function ExpenseCategoryDashboard() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [items, setItems] = useState<CategoryWithStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Control de rebote para evitar recargas constantes y parpadeos
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const reloadCategories = async () => {
        setIsLoading(true);
        try {
            const [categories, expenses] = await Promise.all([
                listExpenseCategories(),
                listInvoiceExpenses()
            ]);

            const enriched: CategoryWithStats[] = categories.map(cat => {
                const catExpenses = expenses.filter(e => e.categoryId === cat.id || e.category?.id === cat.id);
                const totalSpent = catExpenses.reduce((sum, e) => sum + Number(e.total_amount || 0), 0);
                
                // Sort by date_at desc to find latest
                const sorted = [...catExpenses].filter(e => e.date_at).sort((a, b) => new Date(b.date_at!).getTime() - new Date(a.date_at!).getTime());
                const lastExpenseDate = sorted[0]?.date_at;

                return {
                    ...cat,
                    expenseCount: catExpenses.length,
                    totalSpent,
                    lastExpenseDate
                };
            });

            // Sort by totalSpent desc
            enriched.sort((a, b) => b.totalSpent - a.totalSpent);
            
            setItems(enriched);
        } catch {
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void reloadCategories();
    }, []);

    const filtered = items.filter((item) => {
        return debouncedSearch.trim().length === 0
            ? true
            : item.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    });

    const handleDelete = async (id: number) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este servicio? Si ya tiene gastos registrados podría generar problemas de consistencia.")) return;
        await deleteExpenseCategory(id);
        await reloadCategories();
    };

    const stats = useMemo(() => {
        const totalExpensesCount = items.reduce((sum, i) => sum + i.expenseCount, 0);
        const totalMoneySpent = items.reduce((sum, i) => sum + i.totalSpent, 0);
        const mostExpensive = items.length > 0 ? items[0] : null;

        return {
            totalCount: items.length,
            totalExpensesCount,
            totalMoneySpent,
            mostExpensiveName: mostExpensive && mostExpensive.totalSpent > 0 ? mostExpensive.name : "N/A"
        };
    }, [items]);

    return (
        <div className="space-y-6">
            {/* Tarjetas de Estadísticas superiores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Categorías registradas" value={stats.totalCount} color="primary" icon={<FaBoxesStacked size={18} />} variant="compact" />
                <StatsCard title="Gastos registrados" value={stats.totalExpensesCount} color="success" icon={<FaFileInvoiceDollar size={18} />} variant="compact" />
                <StatsCard title="Total gastado" value={money(stats.totalMoneySpent)} color="danger" icon={<FaWallet size={18} />} variant="compact" />
                <StatsCard title="Mayor gasto en" value={stats.mostExpensiveName} color="warning" icon={<FaChartLine size={18} />} variant="compact" />
            </div>

            {/* Contenedor Principal Azul (bg-primary-700) */}
            <section className="bg-primary-700 rounded-lg border border-primary-400 overflow-hidden shadow-xl">
                
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 shrink-0 rounded-lg bg-white/10 flex items-center justify-center">
                            <FaFileInvoiceDollar size={18} className="text-white" />
                        </div>
                        <div className='min-w-0'>
                            <h2 className="text-base font-semibold text-white leading-tight">
                                Gestión de Servicios
                            </h2>
                            <p className="text-xs text-primary-200 mt-0.5">
                                Catálogo de servicios generales y análisis de gasto (agua, luz, internet, etc).
                            </p>
                        </div>
                    </div>
                    <div className='shrink-0'>
                        <CreateExpenseCategoryModalTrigger
                            onCreated={reloadCategories}
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
                </div>

                <ExpenseCategoryTable
                    items={filtered}
                    isLoading={isLoading}
                    onDeleted={handleDelete}
                    onUpdated={reloadCategories}
                />
            </section>
        </div>
    );
}
