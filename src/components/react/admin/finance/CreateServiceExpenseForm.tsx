import { useMemo, useState } from "react";
import useSWR from "swr";
import { Button, ButtonTheme } from "@/components/react/primary/Button";
import { Field } from "@/components/react/primary/Field";
import { SearchableSelect } from "@/components/react/primary/SearchableSelect";
import { Select } from "@/components/react/primary/Select";
import { createInvoiceExpense, listExpenseCategories, type CreateExpenseInvoiceDto } from "@/lib/services/finance/expense-category/expenseCategory.service";
import type { ExpenseCategoryDto } from "@/lib/services/finance/expense-category/expenseCategory.service";
import { getExchangeRates } from "@/lib/services/finance/exchange-rate/exchange_rate.service";
import type { ExchangeRate } from "@/lib/services/finance/exchange-rate/exchange_rate.interface";
import { getPaymentMethods } from "@/lib/services/finance/payment-method/payment_method.service";
import type { PaymentMethod } from "@/lib/services/finance/payment-method/payment_method.interface";
import { getSuppliers } from "@/lib/services/procurement/supplier/supplier.service";
import type { Supplier } from "@/lib/services/procurement/supplier/supplier.interface";
import { Alert } from "@/utils/alerts";

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

export const CreateServiceExpenseForm = () => {
	const [selectedCategory, setSelectedCategory] = useState<string | number>("");
	const [selectedSupplier, setSelectedSupplier] = useState<string | number>("");
	const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | number>("");
	const [amount, setAmount] = useState<number>(0);
	const [expenseDate, setExpenseDate] = useState<string>("");
	const [paymentAmount, setPaymentAmount] = useState<number>(0);
	const [payments, setPayments] = useState<PaymentForm[]>([]);
	const [saving, setSaving] = useState(false);

	const { data: categories = [], error: categoriesError, isLoading: categoriesLoading } = useSWR<ExpenseCategoryDto[]>(
		"expense-service-categories",
		listExpenseCategories
	);

	const { data: suppliers = [], error: suppliersError, isLoading: suppliersLoading } = useSWR<Supplier[]>(
		"expense-service-suppliers",
		getSuppliers
	);

	const { data: paymentMethods = [], error: paymentMethodsError, isLoading: paymentMethodsLoading } = useSWR<PaymentMethod[]>(
		"expense-service-payment-methods",
		getPaymentMethods
	);

	const { data: exchangeRates = [], error: exchangeRatesError, isLoading: exchangeRatesLoading } = useSWR<ExchangeRate[]>(
		"expense-service-exchange-rates",
		getExchangeRates
	);

	const activeExchangeRate = useMemo(() => {
		return exchangeRates.find((rate) => rate.is_active) ?? exchangeRates[0] ?? null;
	}, [exchangeRates]);

	const selectedCategoryData = useMemo(
		() => categories.find((category) => category.id === Number(selectedCategory)),
		[selectedCategory, categories]
	);

	const selectedPaymentMethodData = useMemo(
		() => paymentMethods.find((method) => method.id === Number(selectedPaymentMethod)),
		[selectedPaymentMethod, paymentMethods]
	);

	const totalPaidInUsd = useMemo(() => {
		if (!activeExchangeRate) return 0;

		return payments.reduce((acc, payment) => {
			if (payment.currency === "VES") {
				return acc + payment.amount / Number(activeExchangeRate.rate || 1);
			}

			return acc + payment.amount;
		}, 0);
	}, [payments, activeExchangeRate]);

	const pendingInUsd = Math.max(0, Number(amount || 0) - totalPaidInUsd);
	const loading = categoriesLoading || suppliersLoading || paymentMethodsLoading || exchangeRatesLoading;
	const dataError = categoriesError || suppliersError || paymentMethodsError || exchangeRatesError;

	const categoryOptions = categories.map((category) => ({
		value: category.id,
		label: category.name,
	}));

	const supplierOptions = suppliers.map((supplier) => ({
		value: supplier.id,
		label: supplier.name,
	}));

	const paymentMethodOptions = paymentMethods
		.filter((method) => method.is_active)
		.map((method) => ({
			value: method.id,
			label: `${method.name} (${method.currency})`,
		}));

	const resetForm = () => {
		setSelectedCategory("");
		setSelectedSupplier("");
		setSelectedPaymentMethod("");
		setAmount(0);
		setExpenseDate("");
		setPaymentAmount(0);
		setPayments([]);
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
		if (!selectedCategory) {
			await Alert.error("Categoría requerida", "Selecciona una categoría de gasto.");
			return;
		}

		if (!selectedSupplier) {
			await Alert.error("Proveedor requerido", "Selecciona un proveedor o contraparte.");
			return;
		}

		if (Number(amount) <= 0) {
			await Alert.error("Monto inválido", "El monto total debe ser mayor a cero.");
			return;
		}

		if (payments.length === 0) {
			await Alert.error("Sin pagos", "Agrega al menos un pago para registrar el servicio.");
			return;
		}

		if (!activeExchangeRate) {
			await Alert.error("Sin tasa activa", "No hay tasa de cambio disponible para procesar el gasto.");
			return;
		}

		if (Math.abs(totalPaidInUsd - Number(amount)) > 0.01) {
			await Alert.error(
				"Pagos no cuadran",
				`El total pagado en USD (${formatCurrency(totalPaidInUsd)}) debe coincidir con el monto del servicio (${formatCurrency(Number(amount))}).`
			);
			return;
		}

		const payload: CreateExpenseInvoiceDto = {
			categoryId: Number(selectedCategory),
			supplierId: Number(selectedSupplier),
			exchangeRateId: activeExchangeRate.id,
			total_amount: Number(Number(amount).toFixed(2)),
			date_at: expenseDate || undefined,
			payments: payments.map((payment) => ({
				paymentMethodId: payment.paymentMethodId,
				amount: Number(payment.amount.toFixed(2)),
			})),
		};

		setSaving(true);
		try {
			await createInvoiceExpense(payload);
			await Alert.success("Servicio registrado", "El gasto y sus pagos se guardaron correctamente.");
			resetForm();
		} catch (error) {
			await Alert.error(
				"No se pudo registrar",
				error instanceof Error ? error.message : "Error interno al crear el gasto del servicio."
			);
		} finally {
			setSaving(false);
		}
	};

	if (dataError) {
		const message = dataError instanceof Error ? dataError.message : "Error cargando datos de servicios.";
		return <div className="text-error">{message}</div>;
	}

	if (loading) {
		return <div className="text-primary-700">Cargando datos de servicios...</div>;
	}

	return (
		<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
			<section className="xl:col-span-2 space-y-6">
				<div className="p-5 bg-primary-50 border border-primary-300 rounded-xl space-y-4">
					<h2 className="text-lg font-semibold text-primary-800">Datos del servicio</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<SearchableSelect
							label="Categoría del gasto"
							variant="secondary"
							options={categoryOptions}
							placeholder="Selecciona una categoría"
							value={selectedCategory}
							onChange={(value) => setSelectedCategory(value)}
						/>

						<SearchableSelect
							label="Proveedor / contraparte"
							variant="secondary"
							options={supplierOptions}
							placeholder="Selecciona un proveedor"
							value={selectedSupplier}
							onChange={(value) => setSelectedSupplier(value)}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Field
							label="Monto total (USD)"
							name="amount"
							type="number"
							step="0.01"
							value={amount}
							onChange={(event) => setAmount(Number(event.target.value))}
							variant="secondary"
						/>

						<Field
							label="Fecha del gasto (Opcional)"
							name="expenseDate"
							type="date"
							value={expenseDate}
							onChange={(event) => setExpenseDate(event.target.value)}
							variant="secondary"
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="p-3 bg-primary-100 border border-primary-300 rounded-md text-sm text-primary-700">
							<div className="font-semibold">Tasa activa</div>
							<div>1 USD = {formatCurrency(Number(activeExchangeRate?.rate || 0))} Bs</div>
						</div>

						<div className="p-3 bg-primary-100 border border-primary-300 rounded-md text-sm text-primary-700">
							<div className="font-semibold">Categoría seleccionada</div>
							<div>{selectedCategoryData?.name || "Ninguna"}</div>
						</div>
					</div>
				</div>

				<div className="p-5 bg-primary-50 border border-primary-300 rounded-xl space-y-4">
					<h2 className="text-lg font-semibold text-primary-800">Pagos del servicio</h2>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
						<Select
							label="Método de pago"
							options={paymentMethodOptions}
							variant="secondary"
							placeholder="Selecciona método"
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
											onClick={() => setPayments((prev) => prev.filter((entry) => entry.tempId !== payment.tempId))}
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
							<span>Pagos</span>
							<span>{payments.length}</span>
						</div>
						<div className="flex justify-between">
							<span>Monto total (USD)</span>
							<span>${formatCurrency(Number(amount || 0))}</span>
						</div>
						<div className="flex justify-between text-emerald-300">
							<span>Pagado (USD)</span>
							<span>${formatCurrency(totalPaidInUsd)}</span>
						</div>
						<div className="flex justify-between text-amber-300">
							<span>Pendiente (USD)</span>
							<span>${formatCurrency(pendingInUsd)}</span>
						</div>
						<div className="pt-2 mt-2 border-t border-primary-500 text-xs text-primary-100">
							Total estimado Bs: {formatCurrency(Number(amount || 0) * Number(activeExchangeRate?.rate || 0))}
						</div>
					</div>

					<div className="space-y-2">
						<Button
							label="Registrar servicio"
							adaptive
							loading={saving}
							variant={ButtonTheme.PRIMARY}
							onClick={handleSubmit}
							disabled={saving || Number(amount || 0) <= 0 || !selectedCategory || !selectedSupplier || payments.length === 0}
							className="!bg-emerald-600 hover:!bg-emerald-500"
						/>

						<Button
							label="Limpiar formulario"
							adaptive
							variant={ButtonTheme.GHOST}
							onClick={resetForm}
							className="!text-white hover:!bg-primary-600"
						/>
					</div>
				</div>
			</aside>
		</div>
	);
};