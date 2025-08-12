/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'background-primary': '#0a0a0a',
        'background-secondary': '#111111',
        'background-tertiary': '#1a1a1a',
        'surface-primary': '#1e1e1e',
        'surface-secondary': '#2a2a2a',
        'surface-tertiary': '#333333',
        'text-primary': '#ffffff',
        'text-secondary': '#b3b3b3',
        'text-tertiary': '#808080',
        'accent-primary': '#10b981',
        'accent-secondary': '#059669',
        'accent-tertiary': '#047857',
        'border-primary': '#333333',
        'border-secondary': '#404040',
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'info': '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fadeInUp': 'fadeInUp 0.6s ease-out forwards',
        'fadeInLeft': 'fadeInLeft 0.4s ease-out forwards',
        'slideInRight': 'slideInRight 0.6s ease-out forwards',
        'scaleIn': 'scaleIn 0.5s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'drift': 'drift 8s ease-in-out infinite',
        'constellation': 'constellation 4s ease-in-out infinite',
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
};