import { api } from "@/lib/api";

type ApiOptions = Omit<RequestInit, 'headers'> & {
    headers?: Record<string, string>;
};

type FetcherArgs = string | [string, number] | [string, ApiOptions];

export const fetcher = async (args: FetcherArgs) => {
    let url: string;
    let id: number | undefined;
    let options: ApiOptions | undefined;

    if (Array.isArray(args)) {
        const [rawUrl, second] = args;
        url = rawUrl;

        if (typeof second === 'number') id = second;
        else options = second;
    } else {
        url = args;
    }

    console.log(`📡 SWR Fetching: ${url} (ID: ${id})`); // LOG DE DEBUG

    const endpoint = id !== undefined ? `${url}/${id}` : url;
    const response = await api(endpoint, options ?? {});

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();

    if (json?.data !== undefined) {
        return json.data;
    }

    if (Array.isArray(json)) {
        return json;
    }

    if (json?.items && Array.isArray(json.items)) {
        return json.items;
    }

    return json;
};