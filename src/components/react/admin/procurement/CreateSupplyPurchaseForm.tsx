import { useMemo, useState } from "react";
import useSWR from "swr";
import { Button, ButtonTheme } from "@/components/react/primary/Button";
import { Field } from "@/components/react/primary/Field";
import { SearchableSelect } from "@/components/react/primary/SearchableSelect";
import { Select } from "@/components/react/primary/Select";
import { getToken } from "@/lib/api";
import { getExchangeRates } from "@/lib/services/finance/exchange-rate/exchange_rate.service";
import type { ExchangeRate } from "@/lib/services/finance/exchange-rate/exchange_rate.interface";
import { getPaymentMethods } from "@/lib/services/finance/payment-method/payment_method.service";
import type { PaymentMethod } from "@/lib/services/finance/payment-method/payment_method.interface";
import { getSupplies } from "@/lib/services/inventory/supply/supply.service";
import type { Supply } from "@/lib/services/inventory/supply/supply.interface";
import { createPurchase } from "@/lib/services/procurement/purchase/purchase.service";
import { getSuppliers } from "@/lib/services/procurement/supplier/supplier.service";
import type { Supplier } from "@/lib/services/procurement/supplier/supplier.interface";
import { Alert } from "@/utils/alerts";

type PurchaseItemForm = {
    tempId: string;
    supplyId: number;
    supplyName: string;
    quantity: number;
    unitCost: number;
    total: number;
    expirationDate?: string;
};

type PaymentForm = {
    tempId: string;
    paymentMethodId: number;
    paymentMethodName: string;
    currency: string;
    amount: number;
};

const formatCurrency = (value: number) => {
    const parsed = Number(value || 0);
    return new Intl.NumberFormat("es-VE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(parsed);
};

const parseUserIdFromToken = (): number | null => {
    try {
        const token = getToken();
        if (!token) return null;

        const parts = token.split(".");
        if (parts.length < 2) return null;

        const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson) as { id?: unknown };

        const id = Number(payload.id);
        return Number.isFinite(id) && id > 0 ? id : null;
    } catch {
        return null;
    }
};

export const CreateSupplyPurchaseForm = () => {
    const [selectedSupplier, setSelectedSupplier] = useState<string | number>("");
    const [selectedSupply, setSelectedSupply] = useState<string | number>("");
    const [quantity, setQuantity] = useState<number>(1);
    const [unitCost, setUnitCost] = useState<number>(0);
    const [expirationDate, setExpirationDate] = useState<string>("");
    const [reference, setReference] = useState<string>("");
    const [observation, setObservation] = useState<string>("");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | number>("");
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [items, setItems] = useState<PurchaseItemForm[]>([]);
    const [payments, setPayments] = useState<PaymentForm[]>([]);
    const [saving, setSaving] = useState(false);

    const { data: suppliers = [], error: suppliersError, isLoading: suppliersLoading } = useSWR<Supplier[]>(
        "purchase-suppliers",
        getSuppliers
    );

    const { data: supplies = [], error: suppliesError, isLoading: suppliesLoading } = useSWR<Supply[]>(
        "purchase-supplies",
        () => getSupplies()
    );

    const { data: paymentMethods = [], error: paymentMethodsError, isLoading: paymentMethodsLoading } = useSWR<
        PaymentMethod[]
    >("purchase-payment-methods", getPaymentMethods);

    const { data: exchangeRates = [], error: exchangeRatesError, isLoading: exchangeRatesLoading } = useSWR<
        ExchangeRate[]
    >("purchase-exchange-rates", getExchangeRates);

    const activeExchangeRate = useMemo(() => {
        return exchangeRates.find((rate) => rate.is_active) ?? exchangeRates[0] ?? null;
    }, [exchangeRates]);

    const selectedSupplyData = useMemo(
        () => supplies.find((supply) => supply.id === Number(selectedSupply)),
        [selectedSupply, supplies]
    );

    const selectedPaymentMethodData = useMemo(
        () => paymentMethods.find((method) => method.id === Number(selectedPaymentMethod)),
        [selectedPaymentMethod, paymentMethods]
    );

    const subtotal = useMemo(() => items.reduce((acc, item) => acc + item.total, 0), [items]);

    const paidInUSD = useMemo(() => {
        if (!activeExchangeRate) return 0;

        return payments.reduce((acc, payment) => {
            if (payment.currency === "VES") {
                return acc + payment.amount / Number(activeExchangeRate.rate || 1);
            }
            return acc + payment.amount;
        }, 0);
    }, [payments, activeExchangeRate]);

    const pendingInUSD = Math.max(0, subtotal - paidInUSD);
    const loading = suppliersLoading || suppliesLoading || paymentMethodsLoading || exchangeRatesLoading;
    const dataError = suppliersError || suppliesError || paymentMethodsError || exchangeRatesError;

    const supplierOptions = suppliers.map((supplier) => ({
        value: supplier.id,
        label: supplier.name,
    }));

    const supplyOptions = supplies.map((supply) => ({
        value: supply.id,
        label: `${supply.name}${supply.sku ? ` (${supply.sku})` : ""}`,
    }));

    const paymentMethodOptions = paymentMethods
        .filter((method) => method.is_active)
        .map((method) => ({
            value: method.id,
            label: `${method.name} (${method.currency})`,
        }));

    const addItem = async () => {
        if (!selectedSupply || quantity <= 0 || unitCost <= 0) {
            await Alert.error("Datos incompletos", "Selecciona un insumo y coloca cantidad/costo mayor a cero.");
            return;
        }

        if (!selectedSupplyData) {
            await Alert.error("Insumo inválido", "No se encontró el insumo seleccionado.");
            return;
        }

        const newItem: PurchaseItemForm = {
            tempId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            supplyId: selectedSupplyData.id,
            supplyName: selectedSupplyData.name,
            quantity: Number(quantity),
            unitCost: Number(unitCost),
            total: Number(quantity) * Number(unitCost),
            expirationDate: expirationDate || undefined,
        };

        setItems((prev) => [...prev, newItem]);
        setSelectedSupply("");
        setQuantity(1);
        setUnitCost(0);
        setExpirationDate("");
    };

    const addPayment = async () => {
        if (!selectedPaymentMethod || paymentAmount <= 0) {
            await Alert.error("Pago incompleto", "Selecciona un método de pago y un monto mayor a cero.");
            return;
        }

        if (!selectedPaymentMethodData) {
            await Alert.error("Método inválido", "No se encontró el método de pago seleccionado.");
            return;
        }

        const newPayment: PaymentForm = {
            tempId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            paymentMethodId: selectedPaymentMethodData.id,
            paymentMethodName: selectedPaymentMethodData.name,
            currency: selectedPaymentMethodData.currency,
            amount: Number(paymentAmount),
        };

        setPayments((prev) => [...prev, newPayment]);
        setSelectedPaymentMethod("");
        setPaymentAmount(0);
    };

    const handleSubmit = async () => {
        if (!selectedSupplier) {
            await Alert.error("Proveedor requerido", "Selecciona un proveedor para continuar.");
            return;
        }

        if (items.length === 0) {
            await Alert.error("Sin insumos", "Agrega al menos un insumo a la compra.");
            return;
        }

        if (payments.length === 0) {
            await Alert.error("Sin pagos", "Agrega al menos un pago para registrar la compra.");
            return;
        }

        if (!activeExchangeRate) {
            await Alert.error("Sin tasa activa", "No hay tasa de cambio activa para procesar la compra.");
            return;
        }

        const userId = parseUserIdFromToken();
        if (!userId) {
            await Alert.error("Sesión inválida", "No se pudo identificar el usuario logeado.");
            return;
        }

        if (Math.abs(paidInUSD - subtotal) > 0.01) {
            await Alert.error(
                "Pagos no cuadran",
                `El total pagado en USD (${formatCurrency(paidInUSD)}) debe ser igual al subtotal (${formatCurrency(
                    subtotal
                )}).`
            );
            return;
        }

        setSaving(true);
        try {
            await createPurchase({
                supplierId: Number(selectedSupplier),
                userId,
                exchangeRateId: activeExchangeRate.id,
                status: "COMPLETED",
                reference: reference.trim() || undefined,
                observation: observation.trim() || undefined,
                items: items.map((item) => ({
                    supplyId: item.supplyId,
                    quantity: item.quantity,
                    unit_cost: Number(item.unitCost.toFixed(2)),
                    expiration_date: item.expirationDate || undefined,
                })),
                payments: payments.map((payment) => ({
                    paymentMethodId: payment.paymentMethodId,
                    amount: Number(payment.amount.toFixed(2)),
                })),
            });

            await Alert.success("Compra registrada", "La compra de insumos se guardó correctamente.");

            setItems([]);
            setPayments([]);
            setSelectedSupplier("");
            setSelectedSupply("");
            setQuantity(1);
            setUnitCost(0);
            setExpirationDate("");
            setReference("");
            setObservation("");
            setSelectedPaymentMethod("");
            setPaymentAmount(0);
        } catch (error) {
            await Alert.error(
                "No se pudo registrar",
                error instanceof Error ? error.message : "Error interno al crear la compra."
            );
        } finally {
            setSaving(false);
        }
    };

    if (dataError) {
        const message = dataError instanceof Error ? dataError.message : "Error cargando datos de compras.";
        return <div className="text-error">{message}</div>;
    }

    if (loading) {
        return <div className="text-primary-700">Cargando datos de compra...</div>;
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <section className="xl:col-span-2 space-y-6">
                <div className="p-5 bg-primary-50 border border-primary-300 rounded-xl space-y-4">
                    <h2 className="text-lg font-semibold text-primary-800">Datos de la compra</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SearchableSelect
                            label="Proveedor"
                            variant="secondary"
                            options={supplierOptions}
                            placeholder="Selecciona un proveedor"
                            value={selectedSupplier}
                            onChange={(value) => setSelectedSupplier(value)}
                        />

                        <div className="p-3 bg-primary-100 border border-primary-300 rounded-md text-sm text-primary-700">
                            <div className="font-semibold">Tasa activa</div>
                            <div>
                                1 USD = {formatCurrency(Number(activeExchangeRate?.rate || 0))} Bs
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field
                            label="Referencia (Opcional)"
                            name="reference"
                            value={reference}
                            onChange={(event) => setReference(event.target.value)}
                            placeholder="Ej: OC-2026-001"
                            variant="secondary"
                        />

                        <Field
                            label="Observación (Opcional)"
                            name="observation"
                            value={observation}
                            onChange={(event) => setObservation(event.target.value)}
                            placeholder="Ej: Compra de reposición semanal"
                            variant="secondary"
                        />
                    </div>
                </div>

                <div className="p-5 bg-primary-50 border border-primary-300 rounded-xl space-y-4">
                    <h2 className="text-lg font-semibold text-primary-800">Agregar insumos</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SearchableSelect
                            label="Insumo"
                            variant="secondary"
                            options={supplyOptions}
                            placeholder="Selecciona un insumo"
                            value={selectedSupply}
                            onChange={(value) => {
                                setSelectedSupply(value);
                                const current = supplies.find((supply) => supply.id === Number(value));
                                if (current) {
                                    setUnitCost(Number(current.cost_price || 0));
                                }
                            }}
                        />

                        <Field
                            label="Vencimiento (Opcional)"
                            name="expirationDate"
                            type="date"
                            value={expirationDate}
                            onChange={(event) => setExpirationDate(event.target.value)}
                            variant="secondary"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <Field
                            label="Cantidad"
                            name="quantity"
                            type="number"
                            value={quantity}
                            onChange={(event) => setQuantity(Number(event.target.value))}
                            variant="secondary"
                        />

                        <Field
                            label="Costo unitario (USD)"
                            name="unitCost"
                            type="number"
                            step="0.01"
                            value={unitCost}
                            onChange={(event) => setUnitCost(Number(event.target.value))}
                            variant="secondary"
                        />

                        <div className="text-sm text-primary-700 px-2 pb-2">
                            Total item: <strong>${formatCurrency(quantity * unitCost)}</strong>
                        </div>

                        <Button
                            label="Agregar insumo"
                            variant={ButtonTheme.PRIMARY}
                            onClick={addItem}
                            disabled={!selectedSupply || quantity <= 0 || unitCost <= 0}
                        />
                    </div>

                    <div className="space-y-2">
                        {items.length === 0 ? (
                            <p className="text-sm text-primary-500 italic">Aun no hay insumos agregados.</p>
                        ) : (
                            items.map((item) => (
                                <div
                                    key={item.tempId}
                                    className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-md border border-primary-300 bg-primary-100"
                                >
                                    <div>
                                        <div className="font-medium text-primary-800">{item.supplyName}</div>
                                        <div className="text-xs text-primary-600">
                                            {item.quantity} x ${formatCurrency(item.unitCost)}
                                            {item.expirationDate ? ` | Vence: ${item.expirationDate}` : ""}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-primary-800">${formatCurrency(item.total)}</span>
                                        <button
                                            type="button"
                                            className="text-sm text-error hover:underline"
                                            onClick={() => setItems((prev) => prev.filter((entry) => entry.tempId !== item.tempId))}
                                        >
                                            Quitar
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-5 bg-primary-50 border border-primary-300 rounded-xl space-y-4">
                    <h2 className="text-lg font-semibold text-primary-800">Pagos</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <Select
                            label="Metodo de pago"
                            options={paymentMethodOptions}
                            variant="secondary"
                            placeholder="Selecciona metodo"
                            value={selectedPaymentMethod}
                            onChange={(value) => setSelectedPaymentMethod(value)}
                        />

                        <Field
                            label={`Monto (${selectedPaymentMethodData?.currency || "USD"})`}
                            name="paymentAmount"
                            type="number"
                            step="0.01"
                            value={paymentAmount}
                            onChange={(event) => setPaymentAmount(Number(event.target.value))}
                            variant="secondary"
                        />

                        <Button
                            label="Agregar pago"
                            variant={ButtonTheme.SECONDARY}
                            onClick={addPayment}
                            disabled={!selectedPaymentMethod || paymentAmount <= 0}
                        />
                    </div>

                    <div className="space-y-2">
                        {payments.length === 0 ? (
                            <p className="text-sm text-primary-500 italic">Aun no hay pagos agregados.</p>
                        ) : (
                            payments.map((payment) => (
                                <div
                                    key={payment.tempId}
                                    className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-md border border-primary-300 bg-primary-100"
                                >
                                    <div>
                                        <div className="font-medium text-primary-800">{payment.paymentMethodName}</div>
                                        <div className="text-xs text-primary-600">Moneda: {payment.currency}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-primary-800">
                                            {payment.currency} {formatCurrency(payment.amount)}
                                        </span>
                                        <button
                                            type="button"
                                            className="text-sm text-error hover:underline"
                                            onClick={() =>
                                                setPayments((prev) => prev.filter((entry) => entry.tempId !== payment.tempId))
                                            }
                                        >
                                            Quitar
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            <aside className="xl:col-span-1">
                <div className="sticky top-6 p-5 bg-primary-700 border border-primary-500 rounded-xl text-white space-y-4">
                    <h3 className="text-lg font-semibold">Resumen</h3>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Items</span>
                            <span>{items.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Subtotal (USD)</span>
                            <span>${formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-300">
                            <span>Pagado (USD)</span>
                            <span>${formatCurrency(paidInUSD)}</span>
                        </div>
                        <div className="flex justify-between text-amber-300">
                            <span>Pendiente (USD)</span>
                            <span>${formatCurrency(pendingInUSD)}</span>
                        </div>
                        <div className="pt-2 mt-2 border-t border-primary-500 text-xs text-primary-100">
                            Total estimado Bs: {formatCurrency(subtotal * Number(activeExchangeRate?.rate || 0))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Button
                            label="Registrar compra"
                            adaptive
                            loading={saving}
                            variant={ButtonTheme.PRIMARY}
                            onClick={handleSubmit}
                            disabled={saving || items.length === 0 || !selectedSupplier || payments.length === 0}
                            className="!bg-emerald-600 hover:!bg-emerald-500"
                        />

                        <Button
                            label="Limpiar formulario"
                            adaptive
                            variant={ButtonTheme.GHOST}
                            onClick={() => {
                                setItems([]);
                                setPayments([]);
                                setSelectedSupplier("");
                                setSelectedSupply("");
                                setQuantity(1);
                                setUnitCost(0);
                                setExpirationDate("");
                                setReference("");
                                setObservation("");
                                setSelectedPaymentMethod("");
                                setPaymentAmount(0);
                            }}
                            className="!text-white hover:!bg-primary-600"
                        />
                    </div>
                </div>
            </aside>
        </div>
    );
};
