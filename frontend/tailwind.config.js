/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background Hierarchy
        bg: {
          primary: '#FAFAFA',
          secondary: '#FFFFFF',
          tertiary: '#F7F7F7',
          elevated: '#FFFFFF',
        },
        // Text Hierarchy
        text: {
          primary: '#1A1A1A',
          secondary: '#4A4A4A',
          tertiary: '#737373',
          muted: '#A3A3A3',
        },
        // Thought Node Colors (Research-inspired)
        node: {
          analysis: '#2563EB',
          decision: '#DC2626',
          verification: '#059669',
          alternative: '#D97706',
          implementation: '#7C3AED',
        },
        // Semantic Colors
        accent: {
          primary: '#2563EB',
          success: '#059669',
          warning: '#D97706',
          error: '#DC2626',
        },
        // Borders & Dividers
        border: {
          subtle: '#E5E5E5',
          default: '#D4D4D4',
          strong: '#A3A3A3',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        display: ['Inter', 'sans-serif'],
      },
      fontSize: {
        xs: '0.75rem',     // 12px
        sm: '0.875rem',    // 14px
        base: '1rem',      // 16px
        lg: '1.125rem',    // 18px
        xl: '1.25rem',     // 20px
        '2xl': '1.5rem',   // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem',  // 36px
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeight: {
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.025em',
      },
      spacing: {
        '1': '0.25rem',  // 4px
        '2': '0.5rem',   // 8px
        '3': '0.75rem',  // 12px
        '4': '1rem',     // 16px
        '5': '1.25rem',  // 20px
        '6': '1.5rem',   // 24px
        '8': '2rem',     // 32px
        '10': '2.5rem',  // 40px
        '12': '3rem',    // 48px
        '16': '4rem',    // 64px
        '20': '5rem',    // 80px
        '24': '6rem',    // 96px
      },
      gap: {
        sm: '0.5rem',   // 8px
        md: '1rem',     // 16px
        lg: '2rem',     // 32px
        xl: '4rem',     // 64px
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(0, 0, 0, 0.07)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        none: '0',
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        full: '9999px',
      },
      transitionTimingFunction: {
        'out-cubic': 'cubic-bezier(0.33, 1, 0.68, 1)',
        'in-out-cubic': 'cubic-bezier(0.65, 0, 0.35, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
        viz: '800ms',
      },
      maxWidth: {
        container: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },
    },
  },
  plugins: [],
}

