/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                yum: {
                    primary: '#FF6B6B',    // A warm appetizing red/coral
                    secondary: '#4ECDC4',  // Fresh teal/mint
                    accent: '#FFE66D',     // Yolk yellow
                    dark: '#2d3436',       // Soft black
                    light: '#f9f9f9',      // Off-white background
                },
                // shadcn-compatible colors
                background: '#f9f9f9',
                foreground: '#2d3436',
                primary: {
                    DEFAULT: '#FF6B6B',
                    foreground: '#ffffff',
                },
                'muted-foreground': '#6b7280',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
