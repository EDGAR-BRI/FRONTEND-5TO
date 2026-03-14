import type { APIRoute } from "astro";

type InventoryItemType = "INSUMO" | "SERVICIO";

type InventoryStatus = "ACTIVO" | "INACTIVO";

type InventoryItem = {
	id: number;
	type: InventoryItemType;
	name: string;
	category: string;
	unit?: string; // solo para insumos
	price: number;
	stock?: number; // solo para insumos
	minStock?: number; // solo para insumos
	available?: boolean; // solo para servicios
	status: InventoryStatus;
};

const mockInventory: InventoryItem[] = [
	{
		id: 1,
		type: "INSUMO",
		name: "Guantes de látex (caja x100)",
		category: "Bioseguridad",
		unit: "caja",
		price: 9.5,
		stock: 24,
		minStock: 10,
		status: "ACTIVO",
	},
	{
		id: 2,
		type: "INSUMO",
		name: "Mascarilla quirúrgica (caja x50)",
		category: "Bioseguridad",
		unit: "caja",
		price: 6.25,
		stock: 8,
		minStock: 12,
		status: "ACTIVO",
	},
	{
		id: 3,
		type: "INSUMO",
		name: "Jeringa 5ml (unidad)",
		category: "Insumos médicos",
		unit: "unidad",
		price: 0.35,
		stock: 220,
		minStock: 100,
		status: "ACTIVO",
	},
	{
		id: 4,
		type: "INSUMO",
		name: "Alcohol antiséptico 70% (1L)",
		category: "Limpieza",
		unit: "litro",
		price: 3.75,
		stock: 15,
		minStock: 8,
		status: "ACTIVO",
	},
	{
		id: 5,
		type: "INSUMO",
		name: "Gasas estériles (paquete)",
		category: "Curación",
		unit: "paquete",
		price: 2.1,
		stock: 5,
		minStock: 10,
		status: "ACTIVO",
	},
	{
		id: 6,
		type: "SERVICIO",
		name: "Consulta general",
		category: "Consulta",
		price: 20,
		available: true,
		status: "ACTIVO",
	},
	{
		id: 7,
		type: "SERVICIO",
		name: "Consulta pediatría",
		category: "Consulta",
		price: 25,
		available: true,
		status: "ACTIVO",
	},
	{
		id: 8,
		type: "SERVICIO",
		name: "Toma de presión arterial",
		category: "Procedimientos",
		price: 5,
		available: true,
		status: "ACTIVO",
	},
	{
		id: 9,
		type: "SERVICIO",
		name: "Curación simple",
		category: "Procedimientos",
		price: 12,
		available: false,
		status: "ACTIVO",
	},
	{
		id: 10,
		type: "SERVICIO",
		name: "Certificado médico",
		category: "Documentos",
		price: 8,
		available: true,
		status: "INACTIVO",
	},
];

export const GET: APIRoute = async ({ request }) => {
	return new Response(JSON.stringify(mockInventory), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
			"x-mock": "true",
		},
	});
};
