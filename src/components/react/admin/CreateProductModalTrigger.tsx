import { useEffect, useMemo, useState } from "react";
import { ModalTrigger } from "@/components/react/primary/ModalTrigger";
import { Field } from "@/components/react/primary/Field";
import { Select, type SelectOption } from "@/components/react/primary/Select";
import { CheckBox } from "@/components/react/primary/CheckBox";
import { Button, ButtonTheme } from "@/components/react/primary/Button";
import {
createAdminSupply,
listSupplyCategories,
listSupplyUnits,
type SupplyCategory,
type SupplyUnit,
} from "@/lib/services/admin/admin.service";

type ProductType = "INSUMO" | "SERVICIO";

type ProductDraft = {
type: ProductType;
name: string;
sku: string;
description: string;
categoryId: number | "";
unitId: number | "";
costPrice: number | "";
minStock: number | "";
isActive: boolean;
};

const emptyDraft = (defaultType: ProductType = "INSUMO"): ProductDraft => ({
type: defaultType,
name: "",
sku: "",
description: "",
categoryId: "",
unitId: "",
costPrice: "",
minStock: "",
isActive: true,
});

export default function CreateProductModalTrigger({ onCreated, defaultType, lockType }: { onCreated?: () => void; defaultType?: ProductType; lockType?: boolean }) {
const [draft, setDraft] = useState<ProductDraft>(() => emptyDraft(defaultType ?? "INSUMO"));
const [categories, setCategories] = useState<SupplyCategory[]>([]);
const [units, setUnits] = useState<SupplyUnit[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

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

const typeOptions: SelectOption[] = useMemo(
() => [
{ value: "INSUMO", label: "Insumo" },
{ value: "SERVICIO", label: "Servicio" },
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
<ModalTrigger buttonLabel="Agregar artículo" buttonTheme={ButtonTheme.PRIMARY} modalTitle="Crear insumo o servicio">
{({ close }) => (
<form
className="space-y-4"
onSubmit={async (event) => {
event.preventDefault();
setError(null);
setLoading(true);

try {
if (draft.categoryId === "" || draft.unitId === "") {
setError("Debes seleccionar categoría y unidad de medida.");
return;
}

await createAdminSupply({
type: draft.type,
name: draft.name,
sku: draft.sku || undefined,
description: draft.description || undefined,
cost_price: Number(draft.costPrice),
min_stock: draft.minStock === "" ? 0 : Number(draft.minStock),
categoryId: Number(draft.categoryId),
unitId: Number(draft.unitId),
active: draft.isActive,
});

close();
setDraft(emptyDraft(defaultType ?? "INSUMO"));
onCreated?.();
} catch (err) {
setError(err instanceof Error ? err.message : "No se pudo crear el artículo");
} finally {
setLoading(false);
}
}}
>
{error ? (
<div className="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">{error}</div>
) : null}

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
{!lockType ? (
<Select
label="Tipo"
name="type"
options={typeOptions}
value={draft.type}
onChange={(value) => set("type", value as ProductType)}
/>
) : null}

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

<Field label="Nombre" name="name" placeholder="Ej: Guantes de látex" value={draft.name} onChange={(e) => set("name", e.target.value)} required />

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<Field label="SKU" name="sku" placeholder="Ej: GUA-LTX-100" value={draft.sku} onChange={(e) => set("sku", e.target.value)} />
<Field
label="Costo"
name="costPrice"
type="number"
step="0.01"
placeholder="0.00"
value={draft.costPrice}
onChange={(e) => set("costPrice", e.target.value === "" ? "" : Number(e.target.value))}
required
/>
</div>

<div className="flex flex-col gap-1 w-full">
<label className="font-medium text-xs text-primary-700 w-fit px-1">Descripción</label>
<textarea
name="description"
value={draft.description}
onChange={(e) => set("description", e.target.value)}
placeholder="Opcional"
rows={3}
className="w-full text-cool-gray-10 bg-primary-100 border border-primary-300 rounded-md px-4 py-2 text-body-s placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-60/10 focus:border-primary-60/40 hover:border-primary-60/60 transition-all duration-200"
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
placeholder="0"
value={draft.minStock}
onChange={(e) => set("minStock", e.target.value === "" ? "" : Number(e.target.value))}
/>
</div>

<div className="flex items-center justify-between gap-4 pt-2">
<CheckBox
label="Activo"
variant="switch"
checked={draft.isActive}
onChange={(e) => set("isActive", e.target.checked)}
name="isActive"
/>

<div className="flex gap-3">
<Button
label="Cancelar"
variant={ButtonTheme.SECONDARY}
type="button"
onClick={() => {
close();
setDraft(emptyDraft(defaultType ?? "INSUMO"));
setError(null);
}}
/>
<Button label="Guardar" type="submit" loading={loading} />
</div>
</div>
</form>
)}
</ModalTrigger>
);
}
