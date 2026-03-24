import { DataTable, type Column } from "@/components/react/primary/DataTable";
import { Badge } from "@/components/react/primary/Badge";
import EditProductModalTrigger from "@/components/react/admin/EditProductModalTrigger";
import type { InventoryItem } from "@/types/Inventory";

const money = (value: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);

const statusBadgeStyles = (status: string) => {
    const s = status.toUpperCase();
    if (s === "ACTIVO" || s === "DISPONIBLE" || s === "SUCCESS") {
        return { bg: "bg-primary-200/30", text: "text-primary-700", border: "border-primary-300" };
    }
    if (s === "INACTIVO" || s === "NO DISPONIBLE" || s === "DANGER") {
        return { bg: "bg-error/15", text: "text-error", border: "border-error/20" };
    }
    return { bg: "bg-primary-300/25", text: "text-primary-800", border: "border-primary-400" };
};

export default function SuppliesInventoryTable({ search, type }: { search: string; type: string }) {
    const columns: Column<InventoryItem>[] = [
        { header: "ID", accessorKey: "id", align: "left" },
        {
            header: "Nombre",
            cell: (item) => (
                <div className="flex flex-col text-left">
                    <span className="text-primary-900 font-medium">{item.name}</span>
                    <span className="text-xs text-primary-700">{item.category}</span>
                </div>
            ),
        },
        {
            header: "Tipo",
            align: "center",
            cell: (item) => (
                <Badge styles={{ bg: 'bg-primary-50', text: 'text-primary-600', border: 'border-primary-200' }}>
                    {item.type}
                </Badge>
            ),
        },
        {
            header: "Precio",
            align: "right",
            cell: (item) => <span className="text-primary-700 font-medium">{money(item.price)}</span>,
        },
        {
            header: "Stock / Disponibilidad",
            align: "center",
            cell: (item) => {
                const isService = item.type === "SERVICIO";
                const label = isService ? (item.available ? "Disponible" : "No disponible") : (item.stock?.toString() ?? "0");
                const statusKey = isService ? (item.available ? "SUCCESS" : "DANGER") : (item.stock !== undefined && item.minStock !== undefined && item.stock <= item.minStock ? "WARNING" : "SUCCESS");
                return <Badge styles={statusBadgeStyles(statusKey)}>{label}</Badge>;
            },
        },
        {
            header: "Estado",
            align: "center",
            cell: (item) => <Badge styles={statusBadgeStyles(item.status)}>{item.status}</Badge>,
        },
        {
            header: "Acciones",
            align: "center",
            cell: (item) => (
                <div className="flex justify-center gap-3">
                    <EditProductModalTrigger item={item} />
                    <button className="text-error hover:text-red-700 text-sm font-medium transition-colors">Eliminar</button>
                </div>
            ),
        },
    ];

    const endpoint = `/admin/supplies?search=${search}${type !== 'TODOS' ? `&type=${type}` : ''}`;

    return (
        <DataTable<InventoryItem>
            className="rounded-none! border-none!"
            endpoint={endpoint}
            columns={columns}
        />
    );
}