export type ExchangeRate = {
    id: number,
    rate: number,
    createdAt: string,
    is_active: boolean,
}

export type CreateExchangeRateDto = {
    rate: number;
    is_active?: boolean;
};

export type UpdateExchangeRateDto = {
    rate?: number;
    is_active?: boolean;
};
