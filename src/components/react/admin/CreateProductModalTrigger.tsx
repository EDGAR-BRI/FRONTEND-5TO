import React, { useMemo, useState } from "react";
import { ModalTrigger } from "@/components/react/primary/ModalTrigger";
import { Field } from "@/components/react/primary/Field";
import { Select, type SelectOption } from "@/components/react/primary/Select";
import { CheckBox } from "@/components/react/primary/CheckBox";
import { Button, ButtonTheme } from "@/components/react/primary/Button";

type ProductType = "INSUMO" | "SERVICIO";

type Category = { id: number; name: string };

type MeasurementUnit = { id: number; name: string; symbol: string; is_active: boolean };

type ProductDraft = {
	type: ProductType;
	name: string;
	sku: string;
	description: string;
	image_url: string;
	category_id: number | "";
	unit_id: number | "";
	cost_price: number | "";
	min_stock: number | "";
	is_perishable: boolean;
	is_active: boolean;
};

const mockCategories: Category[] = [
	{ id: 1, name: "Bioseguridad" },
	{ id: 2, name: "Insumos médicos" },
	{ id: 3, name: "Curación" },
	{ id: 4, name: "Consulta" },
	{ id: 5, name: "Procedimientos" },
	{ id: 6, name: "Documentos" },
];

const mockUnits: MeasurementUnit[] = [
	{ id: 1, name: "Unidad", symbol: "u", is_active: true },
	{ id: 2, name: "Caja", symbol: "caja", is_active: true },
	{ id: 3, name: "Litro", symbol: "L", is_active: true },
	{ id: 4, name: "Paquete", symbol: "paq", is_active: true },
];

const emptyDraft = (): ProductDraft => ({
	type: "INSUMO",
	name: "",
	sku: "",
	description: "",
	image_url: "",
	category_id: "",
	unit_id: "",
	cost_price: "",
	min_stock: "",
	is_perishable: false,
	is_active: true,
});

export default function CreateProductModalTrigger() {
	const [draft, setDraft] = useState<ProductDraft>(emptyDraft);

	const typeOptions: SelectOption[] = useMemo(
		() => [
			{ value: "INSUMO", label: "Insumo" },
			{ value: "SERVICIO", label: "Servicio" },
		],
		[]
	);

	const categoryOptions: SelectOption[] = useMemo(
		() => mockCategories.map((c) => ({ value: c.id, label: c.name })),
		[]
	);

	const unitOptions: SelectOption[] = useMemo(
		() => mockUnits.filter((u) => u.is_active).map((u) => ({ value: u.id, label: `${u.name} (${u.symbol})` })),
		[]
	);

	const set = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) => {
		setDraft((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<ModalTrigger
			buttonLabel="Agregar artículo"
			buttonTheme={ButtonTheme.PRIMARY}
			modalTitle="Crear insumo o servicio"
		>
			{({ close }) => (
				<form
					className="space-y-4"
					onSubmit={(e) => {
						e.preventDefault();

						// Mock: por ahora solo logueamos.
						console.log("🧾 Crear producto (mock)", {
							...draft,
							category_id: draft.category_id === "" ? null : draft.category_id,
							unit_id: draft.unit_id === "" ? null : draft.unit_id,
							cost_price: draft.cost_price === "" ? null : Number(draft.cost_price),
							min_stock: draft.min_stock === "" ? null : Number(draft.min_stock),
						});

						close();
						setDraft(emptyDraft());
					}}
				>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Select
							label="Tipo"
							name="type"
							options={typeOptions}
							value={draft.type}
							onChange={(v) => {
								const nextType = v as ProductType;
								set("type", nextType);
								// Ajustes simples cuando cambia el tipo
								if (nextType === "SERVICIO") {
									set("unit_id", "");
									set("min_stock", "");
									set("is_perishable", false);
								}
							}}
						/>

						<Select
							label="Categoría"
							name="category_id"
							options={categoryOptions}
							placeholder="Selecciona una categoría"
							value={draft.category_id}
							onChange={(v) => set("category_id", Number(v))}
							required
						/>
					</div>

					<Field
						label="Nombre"
						name="name"
						placeholder="Ej: Guantes de látex"
						value={draft.name}
						onChange={(e) => set("name", e.target.value)}
						required
					/>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Field
							label="SKU"
							name="sku"
							placeholder="Ej: GUA-LTX-100"
							value={draft.sku}
							onChange={(e) => set("sku", e.target.value)}
						/>

						<Field
							label="URL de imagen"
							name="image_url"
							placeholder="https://..."
							value={draft.image_url}
							onChange={(e) => set("image_url", e.target.value)}
						/>
					</div>

					<div className="flex flex-col gap-1 w-full">
						<label className="font-medium text-xs text-cool-gray-40 w-fit px-1">
							Descripción
						</label>
						<textarea
							name="description"
							value={draft.description}
							onChange={(e) => set("description", e.target.value)}
							placeholder="Opcional"
							rows={3}
							className="w-full text-cool-gray-10 bg-cool-gray-100 border border-cool-gray-80 rounded-md px-4 py-2 text-body-s placeholder-cool-gray-40 focus:outline-none focus:ring-2 focus:ring-primary-60/10 focus:border-primary-60/40 hover:border-primary-60/60 transition-all duration-200"
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Field
							label={draft.type === "SERVICIO" ? "Precio" : "Costo"}
							name="cost_price"
							type="number"
							step="0.01"
							placeholder="0.00"
							value={draft.cost_price}
							onChange={(e) => set("cost_price", e.target.value === "" ? "" : Number(e.target.value))}
							required
						/>

						{draft.type === "INSUMO" ? (
							<Field
								label="Stock mínimo"
								name="min_stock"
								type="number"
								step="1"
								placeholder="0"
								value={draft.min_stock}
								onChange={(e) => set("min_stock", e.target.value === "" ? "" : Number(e.target.value))}
							/>
						) : null}
					</div>

					{draft.type === "INSUMO" ? (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Select
								label="Unidad de medida"
								name="unit_id"
								options={unitOptions}
								placeholder="Selecciona una unidad"
								value={draft.unit_id}
								onChange={(v) => set("unit_id", Number(v))}
								required
							/>

							<div className="flex items-end">
								<CheckBox
									label="Perecible"
									checked={draft.is_perishable}
									onChange={(e) => set("is_perishable", e.target.checked)}
									name="is_perishable"
								/>
							</div>
						</div>
					) : null}

					<div className="flex items-center justify-between gap-4 pt-2">
						<CheckBox
							label="Activo"
							variant="switch"
							checked={draft.is_active}
							onChange={(e) => set("is_active", e.target.checked)}
							name="is_active"
						/>

						<div className="flex gap-3">
							<Button
								label="Cancelar"
								variant={ButtonTheme.SECONDARY}
								type="button"
								onClick={() => {
									close();
									setDraft(emptyDraft());
								}}
							/>
							<Button label="Guardar" type="submit" />
						</div>
					</div>
				</form>
			)}
		</ModalTrigger>
	);
}
