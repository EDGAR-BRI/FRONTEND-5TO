import { useMemo, useState } from "react";
import { ModalTrigger } from "@/components/react/primary/ModalTrigger";
import { Field } from "@/components/react/primary/Field";
import { Select, type SelectOption } from "@/components/react/primary/Select";
import { CheckBox } from "@/components/react/primary/CheckBox";
import { Button, ButtonTheme } from "@/components/react/primary/Button";
import type { InventoryItem, InventoryItemType, InventoryStatus } from "@/types/Inventory";

type ProductDraft = {
	type: InventoryItemType;
	name: string;
	category: string;
	unit: string;
	price: number;
	stock: number;
	minStock: number;
	available: boolean;
	status: InventoryStatus;
};

const toDraft = (item: InventoryItem): ProductDraft => ({
	type: item.type,
	name: item.name,
	category: item.category,
	unit: item.unit ?? "",
	price: item.price,
	stock: item.stock ?? 0,
	minStock: item.minStock ?? 0,
	available: item.available ?? true,
	status: item.status,
});

const numberValue = (value: number) => (value === 0 ? "0" : value);

export default function EditProductModalTrigger({ item }: { item: InventoryItem }) {
	const [draft, setDraft] = useState<ProductDraft>(() => toDraft(item));

	const typeOptions: SelectOption[] = useMemo(
		() => [
			{ value: "INSUMO", label: "Insumo" },
			{ value: "SERVICIO", label: "Servicio" },
		],
		[]
	);

	const statusOptions: SelectOption[] = useMemo(
		() => [
			{ value: "ACTIVO", label: "Activo" },
			{ value: "INACTIVO", label: "Inactivo" },
		],
		[]
	);

	const categoryOptions: SelectOption[] = useMemo(
		() =>
			[
				"Bioseguridad",
				"Insumos médicos",
				"Curación",
				"Limpieza",
				"Consulta",
				"Procedimientos",
				"Documentos",
			].map((c) => ({ value: c, label: c })),
		[]
	);

	const unitOptions: SelectOption[] = useMemo(
		() =>
			[
				{ value: "unidad", label: "Unidad" },
				{ value: "caja", label: "Caja" },
				{ value: "litro", label: "Litro" },
				{ value: "paquete", label: "Paquete" },
			],
		[]
	);

	const set = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) => {
		setDraft((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<ModalTrigger
			modalTitle={`Editar: ${item.name}`}
			trigger={
				<button
					type="button"
					className="text-primary-600 hover:text-primary-800"
					onClick={() => setDraft(toDraft(item))}
				>
					Editar
				</button>
			}
		>
			{({ close }) => (
				<form
					className="space-y-4"
					onSubmit={(e) => {
						e.preventDefault();

						// Mock: por ahora solo logueamos.
						console.log("✏️ Editar producto (mock)", {
							id: item.id,
							...draft,
						});

						close();
						setDraft(toDraft(item));
					}}
				>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Select
							label="Tipo"
							name="type"
							options={typeOptions}
							value={draft.type}
							onChange={(v) => {
								const nextType = v as InventoryItemType;
								set("type", nextType);
								if (nextType === "SERVICIO") {
									set("unit", "");
									set("stock", 0);
									set("minStock", 0);
									set("available", draft.available ?? true);
								} else {
									set("available", true);
								}
							}}
						/>

						<Select
							label="Estado"
							name="status"
							options={statusOptions}
							value={draft.status}
							onChange={(v) => set("status", v as InventoryStatus)}
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
						<Select
							label="Categoría"
							name="category"
							options={categoryOptions}
							placeholder="Selecciona una categoría"
							value={draft.category}
							onChange={(v) => set("category", String(v))}
							required
						/>

						<Field
							label="Precio"
							name="price"
							type="number"
							step="0.01"
							placeholder="0.00"
							value={numberValue(draft.price)}
							onChange={(e) => {
								const v = e.target.value;
								set("price", v === "" ? 0 : Number(v));
							}}
							required
						/>
					</div>

					{draft.type === "INSUMO" ? (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Select
								label="Unidad de medida"
								name="unit"
								options={unitOptions}
								placeholder="Selecciona una unidad"
								value={draft.unit}
								onChange={(v) => set("unit", String(v))}
								required
							/>

							<Field
								label="Stock"
								name="stock"
								type="number"
								step="1"
								placeholder="0"
								value={numberValue(draft.stock)}
								onChange={(e) => {
									const v = e.target.value;
									set("stock", v === "" ? 0 : Number(v));
								}}
							/>
						</div>
					) : (
						<div className="flex items-end">
							<CheckBox
								label="Disponible"
								variant="switch"
								checked={draft.available}
								onChange={(e) => set("available", e.target.checked)}
								name="available"
							/>
						</div>
					)}

					{draft.type === "INSUMO" ? (
						<Field
							label="Stock mínimo"
							name="minStock"
							type="number"
							step="1"
							placeholder="0"
							value={numberValue(draft.minStock)}
							onChange={(e) => {
								const v = e.target.value;
								set("minStock", v === "" ? 0 : Number(v));
							}}
						/>
					) : null}

					<div className="flex items-center justify-end gap-3 pt-2">
						<Button
							label="Cancelar"
							variant={ButtonTheme.SECONDARY}
							type="button"
							onClick={() => {
								close();
								setDraft(toDraft(item));
							}}
						/>
						<Button label="Guardar cambios" type="submit" />
					</div>
				</form>
			)}
		</ModalTrigger>
	);
}
