// Mock API for summary stats
export const GET = async () => {
    const summary = {
        totalIncome: 12500.00,
        totalExpenses: 4320.50,
        netBalance: 8179.50,
        pendingPayments: 5
    };

    return new Response(JSON.stringify(summary), {
        headers: {
            "Content-Type": "application/json"
        }
    });
}
