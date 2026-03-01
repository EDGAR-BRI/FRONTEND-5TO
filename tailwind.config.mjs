/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            fontSize: {
                // Headings (Bold / 700)
                'heading-1': ['54px', { fontWeight: '700', lineHeight: '1.2' }],
                'heading-2': ['42px', { fontWeight: '700', lineHeight: '1.2' }],
                'heading-3': ['32px', { fontWeight: '700', lineHeight: '1.2' }],
                'heading-4': ['24px', { fontWeight: '700', lineHeight: '1.2' }],
                'heading-5': ['20px', { fontWeight: '700', lineHeight: '1.2' }],
                'heading-6': ['18px', { fontWeight: '700', lineHeight: '1.2' }],

                // Subtitles (Medium / 500)
                'subtitle-m': ['16px', { fontWeight: '500', lineHeight: '1.5' }],
                'subtitle-s': ['14px', { fontWeight: '500', lineHeight: '1.5' }],

                // Body (Regular / 400)
                'body-l': ['18px', { fontWeight: '400', lineHeight: '1.5' }],
                'body-m': ['16px', { fontWeight: '400', lineHeight: '1.5' }],
                'body-s': ['14px', { fontWeight: '400', lineHeight: '1.5' }],
                'body-xs': ['12px', { fontWeight: '400', lineHeight: '1.5' }],
                'body-xxs': ['10px', { fontWeight: '400', lineHeight: '1.5' }],

                // Especiales
                'caption': ['20px', { fontWeight: '700', lineHeight: '1.5' }], // Nota: En tu imagen Caption es Bold
                'button-l': ['20px', { fontWeight: '500', lineHeight: '1' }],
                'button-m': ['16px', { fontWeight: '500', lineHeight: '1' }],
                'button-s': ['14px', { fontWeight: '500', lineHeight: '1' }],
                'menu': ['16px', { fontWeight: '500', lineHeight: '1' }],
            },

            colors: {
                primary: {
                    50: '#FBFEFF',
                    100: '#FAFCFF',
                    200: '#BAE0FD',
                    300: '#91C2EA',
                    400: '#6CAEE3',
                    500: '#2785D0',
                    600: '#2479BE',
                    700: '#065185',
                    800: '#072B4A',
                    900: '#001724',
                    60: '#2479BE',
                    90: '#001724',
                    DEFAULT: '#2479BE',
                },
                error: '#DA1E28',
                warning: '#F1C21B',
                success: '#24A148',
                'cool-gray': {
                    10: '#f2f4f8', // Fondo Claro (Aluminio)
                    20: '#dde1e6',
                    30: '#c1c7cd', // Bordes Claro
                    40: '#a2a9b0',
                    50: '#878d96',
                    60: '#697077',
                    70: '#4d5358',
                    80: '#343a3f', // Bordes Oscuro
                    90: '#21272a', // Superficies Oscuras
                    100: '#121619', // Fondo Oscuro
                },
            },
            fontFamily: {
                // Te sugiero importar una fuente como 'Orbitron' o 'Rajdhani' de Google Fonts
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            backgroundImage: {
                'metal-gradient': 'linear-gradient(135deg, #343a3f 0%, #21272a 50%, #121619 100%)',
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'scale-in': {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                'bounce-once': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
            animation: {
                'fade-in': 'fade-in 150ms ease-out',
                'scale-in': 'scale-in 150ms ease-out',
                'bounce-once': 'bounce-once 500ms ease-in-out',
            },
        },
    },
    plugins: [],
}