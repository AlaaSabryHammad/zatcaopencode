import type { Config } from 'tailwindcss';

/**
 * Every value maps to a CSS variable from design/design-system/tokens.css (ported unchanged into
 * src/app/tokens.css). Components use these semantic names only — never raw hex.
 */
const v = (name: string) => `var(--${name})`;

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    screens: {
      sm: '640px',
      md: '1024px',
      lg: '1280px',
      xl: '1440px',
    },
    extend: {
      colors: {
        canvas: v('bg-canvas'),
        surface: {
          DEFAULT: v('bg-surface'),
          sunken: v('bg-sunken'),
          raised: v('bg-raised'),
          hover: v('bg-hover'),
          selected: v('bg-selected'),
          inverse: v('bg-inverse'),
        },
        scrim: v('bg-scrim'),
        fg: {
          DEFAULT: v('ink'),
          secondary: v('ink-secondary'),
          muted: v('ink-muted'),
          disabled: v('ink-disabled'),
          inverse: v('ink-inverse'),
          brand: v('ink-brand'),
        },
        border: {
          subtle: v('border-subtle'),
          DEFAULT: v('border-default'),
          control: v('border-control'),
          focus: v('border-focus'),
        },
        brand: {
          50: v('brand-50'),
          100: v('brand-100'),
          200: v('brand-200'),
          400: v('brand-400'),
          500: v('brand-500'),
          600: v('brand-600'),
          700: v('brand-700'),
          900: v('brand-900'),
          DEFAULT: v('brand-600'),
          on: v('on-brand'),
          'on-deep': v('on-brand-deep'),
        },
        accent: {
          100: v('accent-100'),
          500: v('accent-500'),
          700: v('accent-700'),
          DEFAULT: v('accent-500'),
          on: v('on-accent'),
        },
        success: {
          bg: v('success-bg'),
          fg: v('success-fg'),
          fill: v('success-fill'),
          border: v('success-fg'),
        },
        warning: {
          bg: v('warning-bg'),
          fg: v('warning-fg'),
          fill: v('warning-fill'),
          border: v('warning-fg'),
        },
        danger: {
          bg: v('danger-bg'),
          fg: v('danger-fg'),
          fill: v('danger-fill'),
          border: v('danger-fg'),
          on: v('on-danger'),
        },
        info: { bg: v('info-bg'), fg: v('info-fg'), border: v('info-fg') },
        neutral: { bg: v('neutral-bg'), fg: v('neutral-fg') },
        chart: {
          1: v('chart-1'),
          2: v('chart-2'),
          3: v('chart-3'),
          4: v('chart-4'),
          5: v('chart-5'),
          grid: v('chart-grid'),
        },
      },
      fontFamily: {
        sans: [v('font-sans')],
        arabic: [v('font-arabic')],
        mono: [v('font-mono')],
      },
      fontSize: {
        'display-xl': ['56px', { lineHeight: '60px', letterSpacing: '-0.025em', fontWeight: '650' }],
        'display-lg': ['40px', { lineHeight: '46px', letterSpacing: '-0.02em', fontWeight: '650' }],
        h1: ['28px', { lineHeight: '36px', letterSpacing: '-0.015em', fontWeight: '600' }],
        h2: ['20px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '600' }],
        h3: ['16px', { lineHeight: '24px', fontWeight: '600' }],
        h4: ['14px', { lineHeight: '20px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '26px' }],
        body: ['14px', { lineHeight: '22px' }],
        'body-sm': ['13px', { lineHeight: '20px' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '500' }],
        overline: ['11px', { lineHeight: '16px', letterSpacing: '0.06em', fontWeight: '600' }],
        'ar-display': ['48px', { lineHeight: '64px', fontWeight: '700' }],
        'ar-h1': ['28px', { lineHeight: '42px', fontWeight: '700' }],
        'ar-h2': ['20px', { lineHeight: '32px', fontWeight: '600' }],
        'ar-body': ['15px', { lineHeight: '26px' }],
        'ar-body-sm': ['13px', { lineHeight: '22px' }],
        'num-hero': ['36px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'num-kpi': ['26px', { lineHeight: '32px', letterSpacing: '-0.015em', fontWeight: '600' }],
      },
      spacing: {
        '0.5': v('space-0\\.5'),
        sidebar: v('sidebar-width'),
        'sidebar-collapsed': v('sidebar-collapsed'),
        topbar: v('topbar-height'),
        'control-sm': v('control-sm'),
        'control-md': v('control-md'),
        'control-lg': v('control-lg'),
      },
      maxWidth: {
        content: v('content-max'),
      },
      borderRadius: {
        xs: v('radius-xs'),
        sm: v('radius-sm'),
        DEFAULT: v('radius-md'),
        md: v('radius-md'),
        lg: v('radius-lg'),
        xl: v('radius-xl'),
        '2xl': v('radius-2xl'),
        full: v('radius-full'),
      },
      boxShadow: {
        xs: v('shadow-xs'),
        sm: v('shadow-sm'),
        DEFAULT: v('shadow-sm'),
        md: v('shadow-md'),
        lg: v('shadow-lg'),
        ring: v('zw-ring'),
      },
      zIndex: {
        sticky: v('z-sticky'),
        dropdown: v('z-dropdown'),
        drawer: v('z-drawer'),
        dialog: v('z-dialog'),
        command: v('z-command'),
        toast: v('z-toast'),
      },
      transitionTimingFunction: {
        zw: 'cubic-bezier(.2, .8, .2, 1)',
      },
      transitionDuration: {
        fast: '120ms',
        med: '200ms',
      },
    },
  },
  plugins: [],
};

export default config;
