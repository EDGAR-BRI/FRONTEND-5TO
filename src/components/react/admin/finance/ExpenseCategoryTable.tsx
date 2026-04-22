import { DataTable, type Column } from "@/components/react/primary/DataTable";
import EditExpenseCategoryModalTrigger from "./EditExpenseCategoryModalTrigger";
import type { ExpenseCategoryDto } from "@/lib/services/finance/expense-category/expenseCategory.service";

export type CategoryWithStats = ExpenseCategoryDto & {
    expenseCount: number;
    totalSpent: number;
    lastExpenseDate?: string | null;
};

const money = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Sin registros";
    return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

export default function ExpenseCategoryTable({
    items,
    isLoading,
    onDeleted,
    onUpdated,
}: {
    items: CategoryWithStats[];
    isLoading?: boolean;
    onDeleted: (id: number) => Promise<void>;
    onUpdated?: () => void;
}) {
    const columns: Column<CategoryWithStats>[] = [
        { header: "ID", accessorKey: "id", align: "left" },
        {
            header: "Nombre del Servicio",
            cell: (item) => (
                <span className="text-primary-900 font-medium">{item.name}</span>
            ),
        },
        {
            header: "Registros de gasto",
            align: "center",
            cell: (item) => (
                <span className="text-primary-700">{item.expenseCount} gastos</span>
            ),
        },
        {
            header: "Total Gastado",
            align: "right",
            cell: (item) => (
                <span className="text-primary-800 font-semibold">{money(item.totalSpent)}</span>
            ),
        },
        {
            header: "Último registro",
            align: "center",
            cell: (item) => (
                <span className="text-sm text-primary-600">{formatDate(item.lastExpenseDate)}</span>
            ),
        },
        {
            header: "Acciones",
            align: "center",
            cell: (item) => (
                <div className="flex justify-center gap-3">
                    <EditExpenseCategoryModalTrigger category={item} onUpdated={onUpdated} />
                    <button
                        className="text-error hover:text-red-700 text-sm font-medium transition-colors"
                        onClick={() => void onDeleted(item.id)}
                    >
                        Eliminar
                    </button>
                </div>
            ),
        },
    ];

    return (
        <DataTable<CategoryWithStats>
            className="rounded-none! border-none!"
            endpoint=""
            data={items}
            columns={columns}
            isLoading={isLoading}
        />
    );
}
