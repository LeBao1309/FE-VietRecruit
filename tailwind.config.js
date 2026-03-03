// tailwind.config.js — COMPLETE color replacement
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{vue,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Brand Teal (PRIMARY — unchanged hue, adjusted for light context) ──
        // On a white background, the original #008C8C is too dark/muted.
        // Slightly brighter #009898 gives better contrast and visual pop.
        brand: {
          DEFAULT: "#009898", // Primary CTA, links, active states
          light: "#E6F6F6", // Teal-tinted backgrounds, selected states, badges
          muted: "#CCE9E9", // Hover states on teal elements
          dark: "#007878", // Hover on primary buttons, focus rings
          darker: "#005F5F", // Text on light teal backgrounds (WCAG AA compliant)
          contrast: "#FFFFFF", // Text on brand-colored buttons
        },

        // ── Surface / Background Hierarchy ──
        // Enterprise UIs use subtle off-whites to create depth without shadows.
        // Pure #FFFFFF feels clinical; layered off-whites feel considered.
        surface: {
          DEFAULT: "#FFFFFF", // Page background — pure white for main content
          soft: "#F8FAFA", // Slightly teal-tinted off-white for page bg
          muted: "#F1F5F5", // Section backgrounds, zebra rows
          subtle: "#E8EFEF", // Dividers, subtle card backgrounds
        },

        // ── Panel / Card System ──
        panel: {
          DEFAULT: "#FFFFFF", // Card background
          hover: "#F8FAFA", // Card hover state
          elevated: "#FFFFFF", // Modal, dropdown backgrounds (+ box-shadow for depth)
          border: "#E2E8E8", // Card borders
        },

        // ── Border System ──
        border: {
          DEFAULT: "#E2E8E8", // Standard dividers, input borders
          strong: "#C8D4D4", // Emphasized borders, active input borders
          subtle: "#EFF3F3", // Very light separators
        },

        // ── Text Hierarchy ──
        // Enterprise body text should never be pure black — #1A2B2B is warmer,
        // reduces eye strain in long reading sessions, and ties to the brand teal.
        text: {
          primary: "#1A2B2B", // Headlines, body text — dark teal-black
          secondary: "#4A6565", // Subtext, descriptions — medium teal-gray
          muted: "#7A9595", // Placeholders, helper text — light teal-gray
          disabled: "#A8C0C0", // Disabled state text
          inverse: "#FFFFFF", // Text on brand/dark backgrounds
          link: "#009898", // Hyperlinks — same as brand.DEFAULT
          "link-hover": "#007878", // Hyperlink hover — same as brand.dark
        },

        // ── Semantic / Status Colors ──
        // Keep these universally recognizable; only adjust for light background contrast.
        success: {
          DEFAULT: "#0D9488", // Teal-green (harmonizes with brand)
          light: "#CCFBF1", // Success badge background
          dark: "#0F766E", // Success text on light background
        },
        warning: {
          DEFAULT: "#D97706",
          light: "#FEF3C7",
          dark: "#B45309",
        },
        danger: {
          DEFAULT: "#DC2626",
          light: "#FEE2E2",
          dark: "#B91C1C",
        },
        info: {
          DEFAULT: "#0284C7",
          light: "#E0F2FE",
          dark: "#0369A1",
        },

        // ── Neutral Gray Scale (teal-tinted for brand cohesion) ──
        neutral: {
          50: "#F8FAFA",
          100: "#F1F5F5",
          200: "#E2ECEC",
          300: "#C8D8D8",
          400: "#9AB4B4",
          500: "#6E9090",
          600: "#4A6565",
          700: "#344848",
          800: "#243333",
          900: "#1A2B2B",
        },
      },

      // ── Typography (unchanged from previous setup) ──
      fontFamily: {
        sans: ['"Be Vietnam Pro"', ...defaultTheme.fontFamily.sans],
        display: ['"Be Vietnam Pro"', "serif"],
        mono: ['"Geist Mono"', ...defaultTheme.fontFamily.mono],
      },

      // ── Box Shadow System (critical for light theme depth) ──
      // Light themes use shadows instead of borders to create elevation.
      // All shadows use the brand teal hue at low opacity for cohesion.
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 100, 100, 0.05)",
        sm: "0 1px 3px 0 rgba(0, 100, 100, 0.08), 0 1px 2px -1px rgba(0, 100, 100, 0.04)",
        md: "0 4px 6px -1px rgba(0, 100, 100, 0.08), 0 2px 4px -2px rgba(0, 100, 100, 0.04)",
        lg: "0 10px 15px -3px rgba(0, 100, 100, 0.08), 0 4px 6px -4px rgba(0, 100, 100, 0.04)",
        xl: "0 20px 25px -5px rgba(0, 100, 100, 0.08), 0 8px 10px -6px rgba(0, 100, 100, 0.04)",
        "2xl": "0 25px 50px -12px rgba(0, 100, 100, 0.15)",
        // Brand glow — for CTA buttons and active states
        "brand-sm": "0 0 0 3px rgba(0, 152, 152, 0.15)",
        "brand-md":
          "0 0 20px rgba(0, 152, 152, 0.20), 0 4px 12px rgba(0, 152, 152, 0.15)",
        "brand-lg":
          "0 0 40px rgba(0, 152, 152, 0.25), 0 8px 24px rgba(0, 152, 152, 0.15)",
        // Input focus ring
        focus: "0 0 0 3px rgba(0, 152, 152, 0.20)",
        // Card hover lift
        hover: "0 8px 30px rgba(0, 100, 100, 0.12)",
        // Inner shadow for pressed states
        "inner-brand": "inset 0 2px 4px rgba(0, 100, 100, 0.06)",
        none: "none",
      },

      // ── Animation (unchanged) ──
      animation: {
        marquee: "marquee 30s linear infinite",
        "marquee-reverse": "marquee-reverse 30s linear infinite",
        float: "float 6s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease forwards",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.9" },
        },
      },
    },
  },
  plugins: [],
};
