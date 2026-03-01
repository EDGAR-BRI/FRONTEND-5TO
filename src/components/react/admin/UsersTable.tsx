import { DataTable, type Column } from "@/components/react/primary/DataTable";
import { Badge } from "@/components/react/primary/Badge";
import EditUserModalTrigger from "@/components/react/admin/EditUserModalTrigger";

import type { User, UserRole, UserStatus } from "@/types/User";

const statusBadgeStyles = (status: UserStatus) => {
    if (status === "ACTIVO") {
        return {
            bg: "bg-primary-200/30",
            text: "text-primary-700",
            border: "border-primary-300",
        };
    }
    return {
        bg: "bg-error/15",
        text: "text-error",
        border: "border-error/20",
    };
};

const roleBadgeStyles = (role: UserRole) => {
    switch (role) {
        case "ADMIN":
            return {
                bg: "bg-primary-100",
                text: "text-primary-800",
                border: "border-primary-600",
                borderWidth: "border-2",
                font: "font-bold",
            };
        case "DOCTOR":
            return {
                bg: "bg-primary-100",
                text: "text-primary-600",
                border: "border-primary-400",
                font: "font-semibold",
            };
        case "RECEPCIONISTA":
            return {
                bg: "bg-primary-50",
                text: "text-primary-500",
                border: "border-primary-300",
            };
        default:
            return {
                bg: "bg-gray-100",
                text: "text-gray-700",
                border: "border-gray-300",
            };
    }
};

export default function UsersTable() {
    const columns: Column<User>[] = [
        { header: "ID", accessorKey: "id", align: "left" },
        {
            header: "Nombre / Correo",
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="text-primary-900 font-medium">{item.name}</span>
                    <span className="text-xs text-primary-700">{item.email}</span>
                </div>
            ),
        },
        {
            header: "Rol",
            align: "center",
            cell: (item) => <Badge styles={roleBadgeStyles(item.role)}>{item.role}</Badge>,
        },
        {
            header: "Estado",
            align: "center",
            cell: (item) => (
                <Badge styles={statusBadgeStyles(item.status)}>
                    {item.status}
                </Badge>
            ),
        },
        {
            header: "Acciones",
            align: "center",
            cell: (item) => (
                <div className="flex justify-center gap-2">
                    <EditUserModalTrigger user={item} />
                    <button className="text-error hover:text-red-700 text-sm font-medium transition-colors">
                        Eliminar
                    </button>
                </div>
            ),
        },
    ];

    return (
        <DataTable<User>
            endpoint="/admin/users" // Mock endpoint
            businessId={1} // Assuming businessId is required as in the existing tables
            columns={columns}
        />
    );
}
