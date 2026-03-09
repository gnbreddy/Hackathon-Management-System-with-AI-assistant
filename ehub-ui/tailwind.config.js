/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    'Inter',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    '"Segoe UI"',
                    'Roboto',
                    '"Helvetica Neue"',
                    'Arial',
                    'sans-serif',
                ],
            },
            colors: {
                background: '#fcfcfc',
                surface: 'rgba(255, 255, 255, 0.7)',
                surfaceBorder: 'rgba(0, 0, 0, 0.08)',
                primary: '#0066cc', // Mac OS-like accent blue
                primaryHover: '#005bb5',
                textMain: '#1d1d1f', // Apple typography dark gray
                textMuted: '#86868b',
            },
            boxShadow: {
                'glass': '0 8px 32px rgba(0, 0, 0, 0.04)',
                'glass-hover': '0 12px 48px rgba(0, 0, 0, 0.08)',
                'soft': '0 4px 12px rgba(0, 0, 0, 0.05)',
            },
            animation: {
                'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
}
