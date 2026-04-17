import type { ReactNode } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    align?: "left" | "center" | "right";
    cell?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
    endpoint: string;
    data?: T[];
    columns: Column<T>[];
    isLoading?: boolean;
    className?: string;
    // Props opcionales para paginación (Solo las usará Ventas)
    currentPage?: number;
    onPageChange?: (page: number) => void;
}

export function DataTable<T>({
    endpoint,
    data,
    columns,
    isLoading: externalLoading,
    className,
    currentPage,
    onPageChange
}: DataTableProps<T>) {

    const hasLocalData = Array.isArray(data);
    const swrKey = hasLocalData
        ? null
        : endpoint + (currentPage ? `?page=${currentPage}` : '');

    // Usamos 'any' en el tipo de respuesta para soportar ambos formatos (Array y Objeto)
    const { data: response, error, isLoading: swrLoading } = useSWR<any>(
        swrKey,
        fetcher
    );

    const isLoading = externalLoading || (!hasLocalData && swrLoading);

    if (isLoading) return <TableSkeleton columns={columns.length} />;

    if (!hasLocalData && error) return <div className="text-red-500 p-4 bg-red-500/10 rounded border border-red-500/20">Error al cargar datos</div>;

    // --- LA CORRECCIÓN CLAVE ---
    // 1. Si es un array (Productos), úsalo directo.
    // 2. Si es un objeto (Ventas), extrae la propiedad .data
    const safeData = hasLocalData
        ? (data as T[])
        : (Array.isArray(response) ? response : (response?.data || []));

    // Extraemos paginación solo si existe (Ventas)
    const pagination = hasLocalData ? undefined : response?.pagination;

    if (safeData.length === 0) {
        return <div className="p-8 text-center text-cool-gray-40 bg-primary-400 rounded border border-primary-600">No hay datos que coincidan con tu búsqueda.</div>;
    }

    return (
        <div className={`bg-primary-100 border border-primary-300 rounded-md overflow-hidden flex flex-col ${className ?? ''}`}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-primary-300">
                    <thead className="bg-primary-300">
                        <tr>
                            {columns.map((col, index) => (
                                <th key={index} className={`px-6 py-3 text-xs font-semibold text-primary-900 uppercase tracking-wider ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"}`}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-300">
                        {safeData.map((item: any, rowIndex: number) => (
                            <tr key={rowIndex} className="hover:bg-primary-500/30 transition-colors">
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} className={`px-6 py-4 whitespace-nowrap ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"}`}>
                                        {col.cell ? col.cell(item) : (item as any)[col.accessorKey as string]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer de Paginación: Solo aparece si hay datos de paginación Y función para cambiar */}
            {pagination && onPageChange && (
                <div className="bg-primary-500 px-4 py-3 border-t border-primary-600 flex items-center justify-between">
                    <span className="text-xs text-primary-900">
                        Pág <span className="text-white font-bold">{pagination.page}</span> de {pagination.totalPages}
                        <span className="ml-2 opacity-50">({pagination.total} registros)</span>
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="px-3 py-1 text-xs rounded bg-cool-gray-80 hover:bg-cool-gray-70 disabled:opacity-50 text-white transition-colors"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="px-3 py-1 text-xs rounded bg-cool-gray-80 hover:bg-cool-gray-70 disabled:opacity-50 text-white transition-colors"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const TableSkeleton = ({ columns: _columns }: { columns: number }) => (
    <div className="animate-pulse bg-cool-gray-90 rounded border border-cool-gray-80">
        <div className="h-10 bg-cool-gray-100 border-b border-cool-gray-80" />
        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 border-b border-cool-gray-80" />)}
    </div>
);