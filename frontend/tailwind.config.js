/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
     
        primary: {
          light: '#6EE7B7',
          DEFAULT: '#10B981',
          dark: '#047857',
        },
        // 'secondary' is now its own top-level color object.
        secondary: {
          DEFAULT: '#4F46E5', // Indigo
          dark: '#4338CA',
        },
        
        neutral: {
          lightest: '#F9FAFB',
          light: '#F3F4F6',
          DEFAULT: '#D1D5DB',
          dark: '#4B5563',
          darkest: '#1F2937',
        },
        accent: {
          DEFAULT: '#F59E0B',
          dark: '#B45309',
        },
      },
      boxShadow: {
        'glow': '0 0 0 3px rgba(16, 185, 129, 0.3)',
      },
    },
  },
  plugins: [],
}