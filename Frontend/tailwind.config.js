/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary Olive Green
        olive: {
          50: '#f4f5f0',
          100: '#e8eae0',
          200: '#d1d5c1',
          300: '#b3ba98',
          400: '#959e72',
          500: '#798255',
          600: '#606C38', // Main brand color
          700: '#4a5329',
          800: '#3d4424',
          900: '#343a21',
          950: '#1a1d10',
        },
        // Warm Beige/Cream
        cream: {
          50: '#fdfcfa',
          100: '#f9f5f0',
          200: '#EDE0D4', // Main background color
          300: '#e4d4c4',
          400: '#d4bea8',
          500: '#c4a88c',
          600: '#a88968',
          700: '#8c7054',
          800: '#745c47',
          900: '#604d3d',
        },
        // Golden Yellow/Orange accent
        golden: {
          50: '#fffbeb',
          100: '#fff3c6',
          200: '#ffe588',
          300: '#ffd24a',
          400: '#DDA15E', // Main accent color
          500: '#BC6C25', // Darker accent
          600: '#9a5421',
          700: '#7a411e',
          800: '#653520',
          900: '#552d1e',
        },
      },
      fontFamily: {
        display: ['Fredoka', 'Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 3s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-5deg)' },
          '75%': { transform: 'rotate(5deg)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backgroundImage: {
        'dotted-pattern': 'radial-gradient(circle, #d4d4d4 1px, transparent 1px)',
      },
      backgroundSize: {
        'dotted': '20px 20px',
      },
    },
  },
  plugins: [],
};
