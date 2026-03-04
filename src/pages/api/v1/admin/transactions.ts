
export const GET = async () => {
    // Mock data based on the screenshot provided by user
    const transactions = [
        { 
            id: 1, 
            patientName: 'Carlos Ruiz',
            code: 'CON-001',
            date: '2026-02-28',
            detail: 'Consulta Cardiología',
            provider: 'Dr. Mendoza',
            type: 'income',
            category: 'Consulta', 
            amount: 60.00, 
            status: 'completed' 
        },
        { 
            id: 2, 
            patientName: 'Ana Gómez',
            code: 'FAR-042',
            date: '2026-02-28',
            detail: 'Losartán 50mg, Aspirina',
            provider: 'Mostrador 1',
            type: 'income',
            category: 'Farmacia', 
            amount: 25.50, 
            status: 'completed' 
        },
        { 
            id: 3, 
            patientName: 'Luis Peralta',
            code: 'CON-003',
            date: '2026-02-27',
            detail: 'Consulta General',
            provider: 'Dra. Silva',
            type: 'income',
            category: 'Consulta', 
            amount: 40.00, 
            status: 'pending' 
        },
        { 
            id: 4, 
            patientName: 'María Torres',
            code: 'FAR-045',
            date: '2026-02-27',
            detail: 'Amoxicilina 500mg',
            provider: 'Mostrador 2',
            type: 'income',
            category: 'Farmacia', 
            amount: 15.00, 
            status: 'completed' 
        },
        { 
            id: 5, 
            patientName: 'Pedro Sanchez',
            code: 'CON-004',
            date: '2026-02-26',
            detail: 'Consulta Dermatología',
            provider: 'Dr. Lopez',
            type: 'income',
            category: 'Consulta', 
            amount: 70.00, 
            status: 'cancelled' 
        }
    ];

    return new Response(JSON.stringify({ 
        data: transactions,
        pagination: {
            page: 1,
            limit: 10,
            total: transactions.length,
            totalPages: 1
        }
    }), {
        headers: {
            "Content-Type": "application/json"
        }
    });
}
