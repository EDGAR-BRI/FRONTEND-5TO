import type { Invoice } from '@/lib/services/finance/invoice/invoice.interface';
import { convertirAFechaISO } from './helper_functions';

export function printInvoiceThermal(invoice: Invoice) {
    const patientName = invoice.patient.name ?? invoice.patient.user?.name ?? 'No registrado';
    const patientCI = invoice.patient.ci ?? invoice.patient.user?.ci ?? '—';
    const receptionistName = invoice.receptionist.name;
    const invoiceDate = convertirAFechaISO(invoice.exchangeRate.createdAt);
    const rate = Number(invoice.exchangeRate.rate);

    const payments = Array.isArray(invoice.payments) ? invoice.payments : [invoice.payments];
    const totalUSD = Number(invoice.total_usd);
    const totalBs = (totalUSD * rate).toFixed(2);
    const taxName = invoice.tax?.name ?? '—';
    const taxRate = invoice.tax?.rate ? `${Number(invoice.tax.rate)}%` : '—';
    const totalIGTF = payments.reduce((sum, p) => sum + Number(p.igtf_amount || 0), 0);

    const paymentRows = payments.map(p => {
        const methodName = p.paymentMethod?.name ?? '—';
        const currency = p.paymentMethod?.currency?.toUpperCase() ?? 'USD';
        const isVES = currency.includes('VES') || currency.includes('BS') || currency.includes('BOLIVAR');
        const amountUSD = Number(p.amount_paid);
        const amountDisplay = isVES
            ? `Bs ${(amountUSD * rate).toFixed(2)}`
            : `$${amountUSD.toFixed(2)}`;
        const igtfDisplay = Number(p.igtf_amount) > 0 ? `$${Number(p.igtf_amount).toFixed(2)}` : '—';
        return `<tr><td>${methodName}</td><td>${amountDisplay}</td><td>${igtfDisplay}</td></tr>`;
    }).join('');

    const widthPx = 220;

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Factura #${invoice.id}</title>
<style>
@page { size: auto; margin: 0; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    font-family: 'Courier New', monospace;
    font-size: 10px;
    color: #000;
    background: #fff;
    width: ${widthPx}px;
    padding: 6px;
    line-height: 1.3;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}
.center { text-align: center; }
.bold { font-weight: bold; }
.divider { border-top: 1px dashed #000; margin: 4px 0; }
.row { display: flex; justify-content: space-between; }
table { width: 100%; border-collapse: collapse; font-size: 10px; }
td { padding: 2px 0; vertical-align: top; }
td:nth-child(2), td:nth-child(3) { text-align: right; }
.big { font-size: 13px; font-weight: bold; }
</style>
</head>
<body>
<div class="center bold">VITALFE & ALEGRIA</div>
<div class="center" style="font-size:8px;">Centro Medico</div>
<div class="center">========================</div>
<div class="center bold" style="font-size:12px;">FACTURA</div>
<div class="center">Nro: #${invoice.id}</div>
<div class="center">${invoiceDate}</div>
<div class="divider"></div>
<div><span class="bold">PACIENTE:</span> ${patientName}</div>
<div><span class="bold">C.I.:</span> ${patientCI}</div>
<div><span class="bold">CAJERA:</span> ${receptionistName}</div>
<div class="divider"></div>
<table>
<tr><td class="bold">METODO</td><td class="bold">MONTO</td><td class="bold">IGTF</td></tr>
${paymentRows}
</table>
<div class="divider"></div>
${invoice.tax ? `<div class="row"><span>Impuesto ${taxRate}</span><span>${taxName}</span></div>` : ''}
${totalIGTF > 0 ? `<div class="row"><span>Total IGTF</span><span>$${totalIGTF.toFixed(2)}</span></div>` : ''}
<div class="row big"><span>TOTAL USD</span><span>$${totalUSD.toFixed(2)}</span></div>
<div class="row big"><span>TOTAL BS</span><span>Bs ${totalBs}</span></div>
<div class="divider"></div>
<div class="center" style="font-size:8px;">Tasa: 1 USD = ${rate.toFixed(2)} Bs</div>
<div class="center" style="font-size:8px;">========================</div>
<div class="center" style="font-size:8px;">Doc. generado por VitalFe</div>
<script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
    }
}

export function printAppointmentThermal(data: {
    patientName: string;
    doctorName: string;
    specialty: string;
    date: string;
    time: string;
    price: number;
}) {
    const widthPx = 220;

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Comprobante de Cita</title>
<style>
@page { size: auto; margin: 0; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    font-family: 'Courier New', monospace;
    font-size: 10px;
    color: #000;
    background: #fff;
    width: ${widthPx}px;
    padding: 6px;
    line-height: 1.3;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}
.center { text-align: center; }
.bold { font-weight: bold; }
.divider { border-top: 1px dashed #000; margin: 4px 0; }
.row { display: flex; justify-content: space-between; }
.big { font-size: 13px; font-weight: bold; }
</style>
</head>
<body>
<div class="center bold">VITALFE & ALEGRIA</div>
<div class="center" style="font-size:8px;">Comprobante de Cita</div>
<div class="center">========================</div>
<div><span class="bold">PACIENTE:</span> ${data.patientName}</div>
<div class="divider"></div>
<div><span class="bold">ESPECIALIDAD:</span> ${data.specialty}</div>
<div><span class="bold">DOCTOR:</span> ${data.doctorName}</div>
<div class="divider"></div>
<div class="row"><span><span class="bold">FECHA:</span></span><span>${data.date}</span></div>
<div class="row"><span><span class="bold">HORA:</span></span><span>${data.time}</span></div>
<div class="divider"></div>
<div class="row big"><span>PRECIO:</span><span>$${Number(data.price).toFixed(2)}</span></div>
<div class="center" style="font-size:8px;">========================</div>
<div class="center" style="font-size:8px;">Presente este comprobante en caja</div>
<script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
    }
}

export function printInvoice(invoice: Invoice) {
    const patientName = invoice.patient.name ?? invoice.patient.user?.name ?? 'No registrado';
    const patientCI = invoice.patient.ci ?? invoice.patient.user?.ci ?? '—';
    const receptionistName = invoice.receptionist.name;
    const invoiceDate = convertirAFechaISO(invoice.exchangeRate.createdAt);
    const rate = Number(invoice.exchangeRate.rate);

    const payments = Array.isArray(invoice.payments) ? invoice.payments : [invoice.payments];

    const totalUSD = Number(invoice.total_usd);
    const totalBs = (totalUSD * rate).toFixed(2);

    const taxName = invoice.tax?.name ?? '—';
    const taxRate = invoice.tax?.rate ? `${Number(invoice.tax.rate)}%` : '—';
    const taxCode = invoice.tax?.code ?? '';

    const statusName = invoice.status?.name ?? '—';

    const paymentRows = payments.map(p => {
        const methodName = p.paymentMethod?.name ?? '—';
        const currency = p.paymentMethod?.currency?.toUpperCase() ?? 'USD';
        const isVES = currency.includes('VES') || currency.includes('BS') || currency.includes('BOLIVAR');
        const amountUSD = Number(p.amount_paid);
        const amountDisplay = isVES
            ? `Bs ${(amountUSD * rate).toFixed(2)} <span style="color:#6b7280;font-size:11px;">(≈ $${amountUSD.toFixed(2)})</span>`
            : `$${amountUSD.toFixed(2)}`;
        const igtfDisplay = Number(p.igtf_amount) > 0 ? `$${Number(p.igtf_amount).toFixed(2)}` : '—';
        return `
            <tr>
                <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${methodName}</td>
                <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${currency}</td>
                <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:right;">${amountDisplay}</td>
                <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:right;">${igtfDisplay}</td>
            </tr>
        `;
    }).join('');

    const totalIGTF = payments.reduce((sum, p) => sum + Number(p.igtf_amount || 0), 0);

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Factura #${invoice.id} — VitalFe & Alegría</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #1f2937;
            background: #fff;
            padding: 40px;
            line-height: 1.5;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 24px;
            margin-bottom: 32px;
        }
        .brand h1 {
            font-size: 28px;
            font-weight: 800;
            color: #2563eb;
            letter-spacing: -0.5px;
        }
        .brand p {
            font-size: 13px;
            color: #6b7280;
            margin-top: 4px;
        }
        .invoice-meta {
            text-align: right;
        }
        .invoice-meta h2 {
            font-size: 22px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 6px;
        }
        .invoice-meta .detail {
            font-size: 13px;
            color: #6b7280;
        }
        .invoice-meta .detail strong {
            color: #374151;
        }
        .status-badge {
            display: inline-block;
            padding: 3px 14px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 8px;
        }
        .status-emitida { background: #dbeafe; color: #1d4ed8; }
        .status-pendiente { background: #fef3c7; color: #92400e; }
        .status-anulada { background: #fee2e2; color: #b91c1c; }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 32px;
        }
        .info-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 18px 20px;
        }
        .info-card h3 {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #6b7280;
            margin-bottom: 10px;
            font-weight: 600;
        }
        .info-card p {
            font-size: 14px;
            color: #374151;
            margin-bottom: 3px;
        }
        .info-card p strong {
            color: #1f2937;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }
        thead th {
            background: #f3f4f6;
            padding: 10px 14px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6b7280;
            font-weight: 600;
            border-bottom: 2px solid #e5e7eb;
        }
        thead th:nth-child(3),
        thead th:nth-child(4) {
            text-align: right;
        }
        tbody td {
            font-size: 14px;
        }

        .totals {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 32px;
        }
        .totals-box {
            width: 320px;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 18px;
            font-size: 14px;
            color: #374151;
            border-bottom: 1px solid #f3f4f6;
        }
        .totals-row:last-child {
            border-bottom: none;
        }
        .totals-row.grand {
            background: #2563eb;
            color: #fff;
            font-weight: 700;
            font-size: 16px;
            padding: 14px 18px;
        }
        .totals-row.grand-bs {
            background: #1e40af;
            color: #dbeafe;
            font-weight: 600;
            font-size: 14px;
            padding: 10px 18px;
        }

        .footer {
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        .footer p {
            font-size: 12px;
            color: #9ca3af;
        }
        .footer .exchange {
            font-size: 12px;
            color: #6b7280;
            text-align: right;
        }

        @media print {
            body { padding: 20px; }
            .no-print { display: none !important; }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="brand">
                <h1>VitalFe & Alegría</h1>
                <p>Centro Médico — Sistema de Facturación</p>
            </div>
            <div class="invoice-meta">
                <h2>FACTURA</h2>
                <p class="detail"><strong>Nro:</strong> #${invoice.id}</p>
                <p class="detail"><strong>Fecha:</strong> ${invoiceDate}</p>
                <span class="status-badge ${statusName === 'Emitida' ? 'status-emitida' : statusName === 'Pendiente' ? 'status-pendiente' : 'status-anulada'}">${statusName}</span>
            </div>
        </div>

        <div class="info-grid">
            <div class="info-card">
                <h3>Paciente</h3>
                <p><strong>${patientName}</strong></p>
                <p>C.I.: ${patientCI}</p>
            </div>
            <div class="info-card">
                <h3>Atendido por</h3>
                <p><strong>${receptionistName}</strong></p>
                <p>Recepcionista</p>
            </div>
        </div>

        <h3 style="font-size:14px;font-weight:700;color:#374151;margin-bottom:12px;">Detalle de Pagos</h3>
        <table>
            <thead>
                <tr>
                    <th>Método de Pago</th>
                    <th>Moneda</th>
                    <th>Monto</th>
                    <th>IGTF</th>
                </tr>
            </thead>
            <tbody>
                ${paymentRows}
            </tbody>
        </table>

        <div class="totals">
            <div class="totals-box">
                ${invoice.tax ? `
                <div class="totals-row">
                    <span>Impuesto (${taxName} ${taxCode})</span>
                    <span>${taxRate}</span>
                </div>` : ''}
                ${totalIGTF > 0 ? `
                <div class="totals-row">
                    <span>Total IGTF</span>
                    <span>$${totalIGTF.toFixed(2)}</span>
                </div>` : ''}
                <div class="totals-row grand">
                    <span>Total USD</span>
                    <span>$${totalUSD.toFixed(2)}</span>
                </div>
                <div class="totals-row grand-bs">
                    <span>Total Bs</span>
                    <span>Bs ${totalBs}</span>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Documento generado por el sistema VitalFe & Alegría.<br/>Este documento es un comprobante de pago.</p>
            <div class="exchange">
                <p><strong>Tasa de cambio:</strong> 1 USD = ${rate.toFixed(2)} Bs</p>
                <p>Vigente al ${invoiceDate}</p>
            </div>
        </div>
    </div>

    <script>
        window.onload = function() { window.print(); };
    </script>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
    }
}