import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Primary Orange/Amber Palette - Brand color #FCA311
        primary: {
          50: '#FFF9E5',
          100: '#FFF2CC',
          200: '#FFE499',
          300: '#FFD666',
          400: '#FFC733',
          500: '#FCA311',  // Main brand color
          600: '#E09200',
          700: '#AD7100',
          800: '#7A5000',
          900: '#472F00',
          DEFAULT: "#FCA311",
          foreground: "#000000",
        },

        // Secondary Dark Navy Blue Palette #14213D
        secondary: {
          50: '#E8EAED',
          100: '#D1D5DB',
          200: '#A3ABB7',
          300: '#758193',
          400: '#47576F',
          500: '#14213D',  // Main secondary color
          600: '#101A31',
          700: '#0C1425',
          800: '#080D18',
          900: '#04070C',
          DEFAULT: "#14213D",
          foreground: "#FFFFFF",
        },

        // Semantic Colors
        success: {
          50: '#E8F5E9',
          500: '#43A047',
          700: '#2E7D32',
          DEFAULT: "#43A047",
          light: '#E8F5E9',
          dark: '#2E7D32',
          foreground: "#FFFFFF",
        },
        warning: {
          50: '#FFF3E0',
          500: '#FB8C00',
          700: '#E65100',
          DEFAULT: "#FB8C00",
          foreground: "#FFFFFF",
        },
        error: {
          50: '#FFEBEE',
          500: '#E53935',
          700: '#C62828',
          DEFAULT: "#E53935",
          foreground: "#FFFFFF",
        },
        info: {
          50: '#E3F2FD',
          500: '#1E88E5',
          700: '#1565C0',
          DEFAULT: "#1E88E5",
          foreground: "#FFFFFF",
        },

        // Neutral Grays with Warm Tone
        gray: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },

        // UI Element Colors
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },

      // Typography Scale
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Menlo', 'Monaco', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],    // 12px
        sm: ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],   // 14px
        base: ['1rem', { lineHeight: '1.5', fontWeight: '400' }],     // 16px
        lg: ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],   // 18px
        xl: ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],    // 20px
        '2xl': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],  // 24px
        '3xl': ['1.875rem', { lineHeight: '1.25', fontWeight: '600' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '1.25', fontWeight: '700' }],  // 36px
        '5xl': ['3rem', { lineHeight: '1.25', fontWeight: '700' }],     // 48px
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      lineHeight: {
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },
      letterSpacing: {
        tighter: '-0.02em',
        tight: '-0.01em',
        normal: '0',
        wide: '0.01em',
        wider: '0.05em',
      },

      // 8px Baseline Grid Spacing System
      spacing: {
        '0': '0',
        '0.5': '0.125rem',  // 2px
        '1': '0.25rem',     // 4px
        '2': '0.5rem',      // 8px
        '3': '0.75rem',     // 12px
        '4': '1rem',        // 16px
        '5': '1.25rem',     // 20px
        '6': '1.5rem',      // 24px
        '8': '2rem',        // 32px
        '10': '2.5rem',     // 40px
        '12': '3rem',       // 48px
        '16': '4rem',       // 64px
        '20': '5rem',       // 80px
        '24': '6rem',       // 96px
        '32': '8rem',       // 128px
      },

      // Border Radius Scale
      borderRadius: {
        none: '0',
        xs: '0.125rem',    // 2px
        sm: '0.25rem',     // 4px
        DEFAULT: '0.375rem', // 6px
        md: '0.375rem',    // 6px
        lg: '0.5rem',      // 8px
        xl: '0.75rem',     // 12px
        '2xl': '1rem',     // 16px
        '3xl': '1.5rem',   // 24px
        full: '9999px',
      },

      // Shadow/Elevation System
      boxShadow: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
        sm: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        DEFAULT: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.06)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 8px 10px rgba(0, 0, 0, 0.08)',
        '2xl': '0 25px 50px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1)',

        // Focus shadows
        'focus-primary': '0 0 0 3px rgba(212, 165, 116, 0.3)',
        'focus-error': '0 0 0 3px rgba(229, 57, 53, 0.2)',
        'focus-success': '0 0 0 3px rgba(67, 160, 71, 0.2)',

        // Glow effects for Golden Threads
        'glow-gold': '0 0 20px rgba(212, 165, 116, 0.3), 0 0 40px rgba(212, 165, 116, 0.1)',
        'glow-gold-lg': '0 0 30px rgba(212, 165, 116, 0.4), 0 0 60px rgba(212, 165, 116, 0.15)',

        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        none: 'none',
      },

      // Animation Keyframes
      keyframes: {
        // Existing animations
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },

        // New Golden Threads animations
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        threadFlow: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(300%)' },
        },
        threadPulse: {
          '0%, 100%': {
            boxShadow: '0 0 0 4px rgba(212, 165, 116, 0.2), 0 0 12px rgba(212, 165, 116, 0.3)'
          },
          '50%': {
            boxShadow: '0 0 0 8px rgba(212, 165, 116, 0.1), 0 0 20px rgba(212, 165, 116, 0.4)'
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },

      // Animations
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fadeIn: 'fadeIn 0.2s ease-in',
        slideUp: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        threadFlow: 'threadFlow 2s infinite',
        threadPulse: 'threadPulse 2s infinite',
        shimmer: 'shimmer 2s infinite linear',
      },

      // Background Images
      backgroundImage: {
        "shimmer-gradient": "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)",
        "shimmer-gold": "linear-gradient(90deg, transparent, rgba(212, 165, 116, 0.1), transparent)",
      },

      // Transitions
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
