import { DataTable, type Column } from "@/components/react/primary/DataTable";
import { Badge } from "@/components/react/primary/Badge";
import EditSpecialtyModalTrigger from "./EditSpecialtyModalTrigger";
import type { MedicalSpecialtyDto } from "@/lib/services/medical/specialty/medicalSpecialty.service";
import { Alert } from "@/utils/alerts";

export type SpecialtyWithDoctorCount = MedicalSpecialtyDto & {
    doctorCount?: number;
};

const money = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
};

interface SpecialtyTableProps {
    items: SpecialtyWithDoctorCount[];
    isLoading?: boolean;
    onDeleted: (id: number) => Promise<void>;
    onUpdated?: () => void;
}

export default function SpecialtyTable({ items, isLoading, onDeleted, onUpdated }: SpecialtyTableProps) {
    const columns: Column<SpecialtyWithDoctorCount>[] = [
        { header: "ID", accessorKey: "id", align: "left" },
        {
            header: "Nombre",
            cell: (item) => (
                <span className="text-primary-900 font-medium">{item.name}</span>
            ),
        },
        {
            header: "Precio consulta",
            align: "right",
            cell: (item) => (
                <span className="text-primary-800 font-semibold">{money(item.consultation_price)}</span>
            ),
        },
        {
            header: "% Comisión",
            align: "center",
            cell: (item) => {
                const pct = parseFloat(item.commission_percentage);
                const color = pct > 50 ? "bg-error/10 text-error border-error/20" : pct > 25 ? "bg-warning/10 text-warning border-warning/20" : "bg-success/10 text-success border-success/20";
                return (
                    <Badge
                        styles={{
                            bg: "",
                            text: "",
                            border: "",
                            padding: "px-2 py-0.5",
                        }}
                        className={color}
                    >
                        {item.commission_percentage}%
                    </Badge>
                );
            },
        },
        {
            header: "Doctores",
            align: "center",
            cell: (item) => (
                <span className="text-primary-700">{item.doctorCount ?? 0}</span>
            ),
        },
        {
            header: "Estado",
            align: "center",
            cell: (item) => (
                <Badge
                    styles={{
                        bg: item.active ? "bg-success/10" : "bg-error/10",
                        text: item.active ? "text-success" : "text-error",
                        border: item.active ? "border-success/20" : "border-error/20",
                        padding: "px-2 py-0.5",
                    }}
                >
                    {item.active ? "Activo" : "Inactivo"}
                </Badge>
            ),
        },
        {
            header: "Acciones",
            align: "center",
            cell: (item) => (
                <div className="flex justify-center gap-3">
                    <EditSpecialtyModalTrigger specialty={item} onUpdated={onUpdated} />
                    <button
                        className="text-error hover:text-red-700 text-sm font-medium transition-colors"
                        onClick={async () => {
                            const confirmed = await Alert.confirm(
                                "Desactivar especialidad",
                                `¿Estás seguro de que deseas desactivar "${item.name}"? Los doctores asociados perderán acceso a esta especialidad.`
                            );
                            if (confirmed) {
                                await onDeleted(item.id);
                            }
                        }}
                    >
                        Eliminar
                    </button>
                </div>
            ),
        },
    ];

    return (
        <DataTable<SpecialtyWithDoctorCount>
            className="rounded-none! border-none!"
            endpoint=""
            data={items}
            columns={columns}
            isLoading={isLoading}
        />
    );
}