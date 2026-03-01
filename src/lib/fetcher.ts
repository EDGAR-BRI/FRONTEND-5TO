import { api } from "@/lib/api";

type FetcherArgs = string | [string, number];

export const fetcher = async (args: FetcherArgs) => {
    let url: string;
    let id: number | undefined;

    if (Array.isArray(args)) {
        [url, id] = args;
    } else {
        url = args;
    }

    console.log(`📡 SWR Fetching: ${url} (ID: ${id})`); // LOG DE DEBUG

    const response = await api(url, id || 0);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();

    // --- BLOQUE DE SEGURIDAD ---
    // 1. Si el backend devuelve { data: [...] }
    if (json.data && Array.isArray(json.data)) {
        console.log("✅ Data encontrada (formato json.data):", json.data.length);
        return json.data;
    }
    
    // 2. Si el backend devuelve directamente el array [...]
    if (Array.isArray(json)) {
        console.log("✅ Data encontrada (formato array directo):", json.length);
        return json;
    }

    // 3. Si devuelve paginación { items: [...], total: 10 }
    if (json.items && Array.isArray(json.items)) {
         console.log("✅ Data encontrada (formato json.items):", json.items.length);
        return json.items;
    }

    //console.warn("⚠️ Formato de respuesta desconocido:", json);
    return []; // Retornamos array vacío para que no explote el .map
};