// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  },

  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    react(),
    starlight({
      title: 'Docs · FRONTEND-5TO',
      customCss: ['./src/styles/global.css'],
      sidebar: [
        {
          label: 'Inicio',
          link: '/docs/',
        },
        {
          label: 'Componentes',
          items: [
            { label: 'Íconos',              link: '/docs/components/icons/' },
            { label: 'Button',              link: '/docs/components/button/' },
            { label: 'Field',               link: '/docs/components/field/' },
            { label: 'CheckBox',            link: '/docs/components/checkbox/' },
            { label: 'Modal y ModalTrigger',link: '/docs/components/modal/' },
            { label: 'DataTable',           link: '/docs/components/data-table/' },
            { label: 'StatsCard',           link: '/docs/components/stats-card/' },
            { label: 'Badge',               link: '/docs/components/badge/' },
            { label: 'Avatar',              link: '/docs/components/avatar/' },
            { label: 'Cards',               link: '/docs/components/cards/' },
            { label: 'Spinner y Tooltip',   link: '/docs/components/spinner-tooltip/' },
          ],
        },
        {
          label: 'Services',
          items: [
            { label: 'Introducción', link: '/docs/services/' },
            { label: 'Cliente HTTP del Frontend', link: '/docs/services/api-client/' },
            { label: 'Auth', link: '/docs/services/auth/' },
			{ label: 'User', link: '/docs/services/user/' },
          ],
        },
        {
          label: 'Utils',
          items: [
            { label: 'Introducción', link: '/docs/utils/' },
            { label: 'Alertas (SweetAlert2)', link: '/docs/utils/alerts/' },
          ],
        },
        {
          label: 'Módulos Backend',
          items: [
            { label: 'Introducción al Backend', link: '/docs/api/' },
            { label: 'Finanzas y Facturación', link: '/docs/finance-billing/' },
            {
              label: 'Auth',
              collapsed: true,
              items: [
                { label: 'Login', link: '/docs/api/auth/login/' },
                { label: 'Roles', link: '/docs/api/auth/role/' },
                { label: 'Usuarios', link: '/docs/api/auth/user/' },
              ],
            },
            {
              label: 'Inventory',
              collapsed: true,
              items: [
                { label: 'Categorías', link: '/docs/api/inventory/category/' },
                { label: 'Unidades de medida', link: '/docs/api/inventory/measurement-unit/' },
                { label: 'Insumos', link: '/docs/api/inventory/supply/' },
                { label: 'Lotes de stock', link: '/docs/api/inventory/stock-lot/' },
                { label: 'Movimientos de stock', link: '/docs/api/inventory/stock-movement/' },
                { label: 'Insumos por consulta', link: '/docs/api/inventory/supply-consultation/' },
                { label: 'Presentaciones de insumos', link: '/docs/api/inventory/supply-presentation/' },
              ],
            },
            {
              label: 'Medical',
              collapsed: true,
              items: [
                { label: 'Especialidades', link: '/docs/api/medical/specialty/' },
                { label: 'Pacientes', link: '/docs/api/medical/patient/' },
                { label: 'Doctores', link: '/docs/api/medical/doctor/' },
                { label: 'Consultas', link: '/docs/api/medical/consultation/' },
                { label: 'Prescripciones', link: '/docs/api/medical/prescription/' },
              ],
            },
            {
              label: 'Scheduling',
              collapsed: true,
              items: [
                { label: 'Estatus de cita', link: '/docs/api/scheduling/status-appointment/' },
                { label: 'Tipos de cita', link: '/docs/api/scheduling/appointment-type/' },
                { label: 'Citas', link: '/docs/api/scheduling/appointment/' },
                { label: 'Disponibilidad de doctor', link: '/docs/api/scheduling/doctor-availability/' },
                { label: 'Overrides de agenda del doctor', link: '/docs/api/scheduling/doctor-schedule-override/' },
              ],
            },
            {
              label: 'Expenses',
              collapsed: true,
              items: [
                { label: 'Categorías de gasto', link: '/docs/api/expenses/category/' },
                { label: 'Gastos (InvoiceExpense)', link: '/docs/api/expenses/invoice-expense/' },
                { label: 'Pagos de gasto', link: '/docs/api/expenses/expense-payment/' },
              ],
            },
            {
              label: 'Finance',
              collapsed: true,
              items: [
                { label: 'Tasas de cambio', link: '/docs/api/finance/exchange-rate/' },
                { label: 'Impuestos', link: '/docs/api/finance/tax/' },
                { label: 'Métodos de pago', link: '/docs/api/finance/payment-method/' },
                { label: 'Status de factura', link: '/docs/api/finance/status-invoice/' },
                { label: 'Facturas', link: '/docs/api/finance/invoice/' },
                { label: 'Pagos de factura', link: '/docs/api/finance/invoice-payment/' },
              ],
            },
            {
              label: 'Procurement',
              collapsed: true,
              items: [
                { label: 'Proveedores', link: '/docs/api/procurement/supplier/' },
                { label: 'Compras', link: '/docs/api/procurement/purchase/' },
                { label: 'Pagos de compra', link: '/docs/api/procurement/purchase-payment/' },
              ],
            },
          ],
        },
      ],
    }),
  ],
});
