export interface Supply {
    id: number;
    name: string;
    sku?: string;
    description?: string;
    image_url?: string;
    cost_price: number;
    min_stock: number;
    is_perishable: boolean;
    active: boolean;
    type?: string;
    stock?: number;
    categoryId: number;
    unitId: number;
}
