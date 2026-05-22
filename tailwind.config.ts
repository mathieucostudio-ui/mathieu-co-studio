import type { Config } from 'tailwindcss';

// ─────────────────────────────────────────────
//  Palette officielle Mathieu&Co — PROMPT MASTER v2.0
// ─────────────────────────────────────────────
const colors = {
  // ── Neutres ──────────────────────────────
  noir:       '#151515',
  'noir-soft':'#2A2A2A',
  blanc:      '#FFFFFF',

  // ── Beige scale (clair → foncé) ──────────
  beige:      '#F2EDE8',
  beige2:     '#EAE3DA',
  beige3:     '#DAD1C6',
  beige4:     '#CEC4B8',
  beige5:     '#BFB4A6',

  // ── Or / Gold scale ───────────────────────
  'or-light': '#D4A85C',
  or:         '#B8893A',
  'or-dark':  '#8A6030',
  'or-xdark': '#5E3E18',

  // ── Gris scale ────────────────────────────
  'gris-cl':  '#E0DEDA',
  gris:       '#84827F',
  'gris-dark':'#5A5856',

  // ── Accents ───────────────────────────────
  rouge:      '#C84030',
  'rouge-light':'#E85040',
  vert:       '#3A8A3A',
  'vert-light':'#4A9A4A',
} as const;

// ─────────────────────────────────────────────
//  Config Tailwind
// ─────────────────────────────────────────────
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      // ── Couleurs ──────────────────────────
      colors,

      // ── Typographie ───────────────────────
      fontFamily: {
        sans:    ['var(--font-inter)',     'Arial',   'sans-serif'],
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
      },

      fontSize: {
        '2xs': ['0.625rem',  { lineHeight: '1rem',    letterSpacing: '0.04em'  }], // 10px
        xs:    ['0.6875rem', { lineHeight: '1.125rem', letterSpacing: '0.02em' }], // 11px
        sm:    ['0.8125rem', { lineHeight: '1.25rem'  }],                          // 13px
        base:  ['0.9375rem', { lineHeight: '1.5rem'   }],                          // 15px
        lg:    ['1.0625rem', { lineHeight: '1.625rem' }],                          // 17px
        xl:    ['1.1875rem', { lineHeight: '1.75rem'  }],                          // 19px
        '2xl': ['1.375rem',  { lineHeight: '1.875rem' }],                          // 22px
        '3xl': ['1.75rem',   { lineHeight: '2.125rem' }],                          // 28px
        '4xl': ['2.25rem',   { lineHeight: '2.625rem' }],                          // 36px
        '5xl': ['3rem',      { lineHeight: '3.5rem'   }],                          // 48px
        '6xl': ['3.75rem',   { lineHeight: '4.25rem'  }],                          // 60px
        '7xl': ['4.5rem',    { lineHeight: '5rem'     }],                          // 72px
        '8xl': ['6rem',      { lineHeight: '1'        }],                          // 96px
      },

      fontWeight: {
        thin:       '100',
        extralight: '200',
        light:      '300',
        normal:     '400',
        medium:     '500',
        semibold:   '600',
        bold:       '700',
      },

      letterSpacing: {
        tightest:   '-0.04em',
        tighter:    '-0.02em',
        tight:      '-0.01em',
        normal:     '0em',
        wide:       '0.04em',
        wider:      '0.08em',
        widest:     '0.18em',
        'ultra-wide':'0.28em',
      },

      lineHeight: {
        none:   '1',
        tight:  '1.2',
        snug:   '1.35',
        normal: '1.5',
        relaxed:'1.65',
        loose:  '2',
      },

      // ── Ombres ────────────────────────────
      boxShadow: {
        xs:          '0 1px 4px 0 rgba(21,21,21,0.04)',
        card:        '0 2px 12px 0 rgba(21,21,21,0.06)',
        'card-hover':'0 8px 32px 0 rgba(21,21,21,0.12)',
        nav:         '0 1px 16px 0 rgba(21,21,21,0.06)',
        modal:       '0 24px 64px 0 rgba(21,21,21,0.18)',
        or:          '0 4px 20px 0 rgba(184,137,58,0.28)',
        'or-lg':     '0 8px 32px 0 rgba(184,137,58,0.22)',
        inner:       'inset 0 2px 6px 0 rgba(21,21,21,0.06)',
      },

      // ── Rayons ────────────────────────────
      borderRadius: {
        none:    '0',
        sm:      '2px',
        DEFAULT: '4px',
        md:      '6px',
        lg:      '8px',
        xl:      '12px',
        '2xl':   '16px',
        full:    '9999px',
      },

      // ── Transitions ───────────────────────
      transitionTimingFunction: {
        'spring':     'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-expo':    'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'out-expo':   'cubic-bezier(0.19, 1, 0.22, 1)',
        'in-out-back':'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },

      transitionDuration: {
        '0':   '0ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '700': '700ms',
      },

      // ── Animations CSS ────────────────────
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeOut: {
          from: { opacity: '1' },
          to:   { opacity: '0' },
        },
        fadeInDown: {
          from: { opacity: '0', transform: 'translateY(-16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to:   { backgroundPosition: '200% 0' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
      },

      animation: {
        fadeIn:      'fadeIn      0.35s ease-out both',
        fadeOut:     'fadeOut     0.25s ease-in  both',
        fadeInDown:  'fadeInDown  0.5s  cubic-bezier(0.16,1,0.3,1) both',
        fadeInUp:    'fadeInUp    0.5s  cubic-bezier(0.16,1,0.3,1) both',
        fadeInLeft:  'fadeInLeft  0.4s  cubic-bezier(0.16,1,0.3,1) both',
        fadeInRight: 'fadeInRight 0.4s  cubic-bezier(0.16,1,0.3,1) both',
        scaleIn:     'scaleIn     0.3s  cubic-bezier(0.16,1,0.3,1) both',
        shimmer:     'shimmer     2s    linear infinite',
        spin:        'spin        0.8s  linear infinite',
        pulse:       'pulse       2s    ease-in-out infinite',
      },
    },
  },

  plugins: [],
};

export default config;
