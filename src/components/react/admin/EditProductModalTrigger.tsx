import { useEffect, useMemo, useState } from "react";
import { ModalTrigger } from "@/components/react/primary/ModalTrigger";
import { Field } from "@/components/react/primary/Field";
import { Select, type SelectOption } from "@/components/react/primary/Select";
import { CheckBox } from "@/components/react/primary/CheckBox";
import { Button, ButtonTheme } from "@/components/react/primary/Button";
import type { InventoryItem, InventoryStatus } from "@/types/Inventory";
import {
	listSupplyCategories,
	listSupplyUnits,
	type SupplyCategory,
	type SupplyUnit,
	updateAdminSupply,
} from "@/lib/services/admin/admin.service";

type ProductDraft = {
	name: string;
	categoryId: number | "";
	unitId: number | "";
	price: number;
	stock: number;
	minStock: number;
	status: InventoryStatus;
	sku: string;
	description: string;
};

const toDraft = (item: InventoryItem): ProductDraft => ({
	name: item.name,
	categoryId: item.categoryId ?? "",
	unitId: item.unitId ?? "",
	price: item.price,
	stock: item.stock ?? 0,
	minStock: item.minStock ?? 0,
	status: item.status,
	sku: item.sku ?? "",
	description: item.description ?? "",
});

export default function EditProductModalTrigger({
	item,
	onUpdated,
}: {
	item: InventoryItem;
	onUpdated?: () => void;
}) {
	const [draft, setDraft] = useState<ProductDraft>(() => toDraft(item));
	const [categories, setCategories] = useState<SupplyCategory[]>([]);
	const [units, setUnits] = useState<SupplyUnit[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setDraft(toDraft(item));
	}, [item]);

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const [categoriesData, unitsData] = await Promise.all([
					listSupplyCategories(),
					listSupplyUnits(),
				]);
				if (!mounted) return;
				setCategories(categoriesData);
				setUnits(unitsData);
			} catch {
				if (!mounted) return;
				setCategories([]);
				setUnits([]);
			}
		})();

		return () => {
			mounted = false;
		};
	}, []);

	const statusOptions: SelectOption[] = useMemo(
		() => [
			{ value: "ACTIVO", label: "Activo" },
			{ value: "INACTIVO", label: "Inactivo" },
		],
		[]
	);

	const categoryOptions: SelectOption[] = useMemo(
		() => categories.map((category) => ({ value: category.id, label: category.name })),
		[categories]
	);

	const unitOptions: SelectOption[] = useMemo(
		() => units.map((unit) => ({ value: unit.id, label: `${unit.name} (${unit.symbol})` })),
		[units]
	);

	const set = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) => {
		setDraft((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<ModalTrigger
			modalTitle={`Editar: ${item.name}`}
			trigger={
				<Button
					label="Editar"
					variant={ButtonTheme.SECONDARY}
					className="text-xs h-8 px-4 font-bold border-primary-200"
					onClick={() => setDraft(toDraft(item))}
				/>
			}
		>
			{({ close }) => (
				<form
					className="space-y-4"
					onSubmit={async (e) => {
						e.preventDefault();
						setError(null);
						setLoading(true);

						try {
							await updateAdminSupply(item.id, {
								name: draft.name,
								sku: draft.sku || undefined,
								description: draft.description || undefined,
								cost_price: draft.price,
								min_stock: draft.minStock,
								categoryId: draft.categoryId === "" ? undefined : Number(draft.categoryId),
								unitId: draft.unitId === "" ? undefined : Number(draft.unitId),
								active: draft.status === "ACTIVO",
							});

							close();
							onUpdated?.();
						} catch (err) {
							setError(err instanceof Error ? err.message : "No se pudo actualizar el artículo");
						} finally {
							setLoading(false);
						}
					}}
				>
					{error ? (
						<div className="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">{error}</div>
					) : null}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Select
							label="Estado"
							name="status"
							options={statusOptions}
							value={draft.status}
							onChange={(value) => set("status", value as InventoryStatus)}
						/>

						<Select
							label="Categoría"
							name="categoryId"
							options={categoryOptions}
							placeholder="Selecciona una categoría"
							value={draft.categoryId}
							onChange={(value) => set("categoryId", Number(value))}
							required
						/>
					</div>

					<Field label="Nombre" name="name" value={draft.name} onChange={(e) => set("name", e.target.value)} required />

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Field label="SKU" name="sku" value={draft.sku} onChange={(e) => set("sku", e.target.value)} />
						<Field
							label="Costo"
							name="price"
							type="number"
							step="0.01"
							value={draft.price}
							onChange={(e) => set("price", Number(e.target.value || 0))}
							required
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Select
							label="Unidad de medida"
							name="unitId"
							options={unitOptions}
							placeholder="Selecciona una unidad"
							value={draft.unitId}
							onChange={(value) => set("unitId", Number(value))}
							required
						/>

						<Field
							label="Stock mínimo"
							name="minStock"
							type="number"
							step="1"
							value={draft.minStock}
							onChange={(e) => set("minStock", Number(e.target.value || 0))}
						/>
					</div>

					<div className="flex flex-col gap-1 w-full">
						<label className="font-medium text-xs text-primary-700 w-fit px-1">Descripción</label>
						<textarea
							name="description"
							value={draft.description}
							onChange={(e) => set("description", e.target.value)}
							rows={3}
							className="w-full text-cool-gray-10 bg-primary-100 border border-primary-300 rounded-md px-4 py-2 text-body-s placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-60/10 focus:border-primary-60/40 hover:border-primary-60/60 transition-all duration-200"
						/>
					</div>

					<div className="flex items-center justify-between gap-4 pt-2">
						<CheckBox
							label="Activo"
							variant="switch"
							checked={draft.status === "ACTIVO"}
							onChange={(e) => set("status", e.target.checked ? "ACTIVO" : "INACTIVO")}
							name="active"
						/>

						<div className="flex gap-3">
							<Button
								label="Cancelar"
								variant={ButtonTheme.SECONDARY}
								type="button"
								onClick={() => {
									close();
									setDraft(toDraft(item));
									setError(null);
								}}
							/>
							<Button label="Guardar cambios" type="submit" loading={loading} />
						</div>
					</div>
				</form>
			)}
		</ModalTrigger>
	);
}
