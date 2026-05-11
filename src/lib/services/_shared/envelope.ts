const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === "object" && value !== null;
};

export const readEnvelopeData = async <T,>(response: Response): Promise<T> => {
	try {
		const json: unknown = await response.json();
		if (isRecord(json) && "data" in json) return (json as { data: T }).data;
		if (isRecord(json) && "message" in json) return json as unknown as T;
		return json as T;
	} catch {
		const text = await response.text().catch(() => '');
		throw new Error(`Invalid JSON response: ${text.slice(0, 100)}`);
	}
};

export const readEnvelopeErrorMessage = async (response: Response): Promise<string> => {
	let message = `Error ${response.status}: ${response.statusText}`;
	try {
		const json: unknown = await response.json();
		if (isRecord(json)) {
			const maybeMessage =
				(typeof json.message === "string" && json.message) ||
				(typeof json.error === "string" && json.error) ||
				(isRecord(json.data) && typeof json.data.message === "string" && json.data.message);
			if (maybeMessage) message = maybeMessage;
		}
	} catch {
		// ignore
	}
	return message;
};
