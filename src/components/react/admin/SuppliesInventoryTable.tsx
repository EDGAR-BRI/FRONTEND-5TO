import React from "react";
import { DataTable, type Column } from "@/components/react/primary/DataTable";
import { Badge } from "@/components/react/primary/Badge";

export type InventoryItemType = "INSUMO" | "SERVICIO";
export type InventoryStatus = "ACTIVO" | "INACTIVO";

export type InventoryItem = {
	id: number;
	type: InventoryItemType;
	name: string;
	category: string;
	unit?: string;
	price: number;
	stock?: number;
	minStock?: number;
	available?: boolean;
	status: InventoryStatus;
};

const money = (value: number) =>
	new Intl.NumberFormat("es-EC", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
	}).format(value);

const statusBadgeStyles = (status: "neutral" | "success" | "warning" | "danger") => {
	if (status === "success") {
		return {
			bg: "bg-primary-200/30",
			text: "text-primary-700",
			border: "border-primary-300",
		};
	}
	if (status === "warning") {
		return {
			bg: "bg-primary-300/25",
			text: "text-primary-800",
			border: "border-primary-400",
		};
	}
	if (status === "danger") {
		return {
			bg: "bg-error/15",
			text: "text-error",
			border: "border-error/20",
		};
	}

	return {
		bg: "bg-primary-100",
		text: "text-primary-700",
		border: "border-primary-300",
	};
};

const typeBadgeStyles = (type: InventoryItemType) =>
	type === "INSUMO"
		? {
			bg: "bg-primary-100",
			text: "text-primary-600",
			border: "border-primary-300",
			borderWidth: "border-2",
			font: "font-semibold",
		}
		: {
			bg: "bg-primary-100",
			text: "text-primary-700",
			border: "border-primary-700",
			borderWidth: "border-2",
			font: "font-semibold",
		};

export default function SuppliesInventoryTable({ businessId = 1 }: { businessId?: number }) {
	const columns: Column<InventoryItem>[] = [
		{ header: "ID", accessorKey: "id", align: "left" },
		{
			header: "Nombre",
			cell: (item) => (
				<div className="flex flex-col">
					<span className="text-primary-900 font-medium">{item.name}</span>
					<span className="text-xs text-primary-700">
						{item.category}
						{item.type === "INSUMO" && item.unit ? ` • ${item.unit}` : ""}
					</span>
				</div>
			),
		},
		{
			header: "Tipo",
			align: "center",
			cell: (item) => <Badge styles={typeBadgeStyles(item.type)}>{item.type}</Badge>,
		},
		{
			header: "Precio",
			align: "right",
			cell: (item) => <span className="text-primary-700">{money(item.price)}</span>,
		},
		{
			header: "Stock / Disponibilidad",
			align: "center",
			cell: (item) => {
				if (item.type === "SERVICIO") {
					return (
                        <Badge styles={statusBadgeStyles(item.available ? "success" : "warning")}>
                            {item.available ? "Disponible" : "No disponible"}
                        </Badge>
					);
				}

				const stock = item.stock ?? 0;
				const min = item.minStock ?? 0;
				const variant = stock <= 0 ? "danger" : stock < min ? "warning" : "success";

				return (
					<div className="font-semibold">
						<Badge styles={statusBadgeStyles(variant)}>{stock}</Badge>
					</div>
				);
			},
		},
		{
			header: "Estado",
			align: "center",
			cell: (item) => (
				<Badge styles={statusBadgeStyles(item.status === "ACTIVO" ? "success" : "neutral")}>
					{item.status}
				</Badge>
			),
		},
	];

	return (
		<DataTable<InventoryItem>
			endpoint="/admin/supplies"
			businessId={businessId}
			columns={columns}
		/>
	);
}
