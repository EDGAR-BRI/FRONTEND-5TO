export const money = (value: number, currency = "USD") =>
	new Intl.NumberFormat("es-VE", {
		style: "currency",
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(Number(value || 0));

export const normalizeCurrency = (currency?: string | null) => (currency?.toUpperCase() === "VES" ? "VES" : "USD");

export const convertAmount = (amount: number, fromCurrency: string, toCurrency: "USD" | "VES", rate?: number | null) => {
	const normalizedFrom = normalizeCurrency(fromCurrency);
	const normalizedRate = Number(rate || 0);
	const baseAmount = Number(amount || 0);

	if (normalizedFrom === toCurrency) {
		return baseAmount;
	}

	if (!normalizedRate) {
		return 0;
	}

	if (normalizedFrom === "USD" && toCurrency === "VES") {
		return baseAmount * normalizedRate;
	}

	if (normalizedFrom === "VES" && toCurrency === "USD") {
		return baseAmount / normalizedRate;
	}

	return baseAmount;
};

export const dualAmount = (amount: number, currency?: string | null, rate?: number | null) => {
	const normalizedCurrency = normalizeCurrency(currency);

	return {
		usd: convertAmount(amount, normalizedCurrency, "USD", rate),
		ves: convertAmount(amount, normalizedCurrency, "VES", rate),
	};
};
