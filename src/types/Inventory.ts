export type InventoryItemType = "INSUMO" | "SERVICIO";
export type InventoryStatus = "ACTIVO" | "INACTIVO";

export type InventoryItem = {
	id: number;
	type: InventoryItemType;
	name: string;
	category: string;
	categoryId?: number;
	unit?: string;
	unitId?: number;
	price: number;
	stock?: number;
	minStock?: number;
	available?: boolean;
	status: InventoryStatus;
	sku?: string;
	description?: string;
};
