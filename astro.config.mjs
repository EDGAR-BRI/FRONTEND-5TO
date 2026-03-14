// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname
      }
    }
  },

  output: 'server',
  integrations: [
    react(),
    starlight({
      title: 'Docs · FRONTEND-5TO',
      sidebar: [
        {
          label: 'Inicio',
          link: '/docs/',
        },
        {
          label: 'Componentes',
          items: [
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
      ],
    }),
  ],
});