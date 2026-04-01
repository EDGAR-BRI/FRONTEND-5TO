const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === "object" && value !== null;
};

export const readEnvelopeData = async <T,>(response: Response): Promise<T> => {
	const json: unknown = await response.json();
	if (isRecord(json) && "data" in json) return (json as { data: T }).data;
	return json as T;
};
