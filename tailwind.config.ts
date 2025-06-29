// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  // darkMode: "class", // Enable class strategy
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: { // Optional: Define container defaults
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px", },
    },
    extend: {
      colors: { // Map CSS variables to Tailwind color names
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))", },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))", },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))", },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))", },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))", },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))", },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))", },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        loaderSpin: {
          '0%': { transform: 'rotate(-45deg)' },
          '50%': { transform: 'rotate(-425deg)', borderRadius: '50%' }, // Adjusted rotation for full spin + return
          '100%': { transform: 'rotate(-45deg)' },
        },
         "pulse-subtle": {
           "0%, 100%": { opacity: '0.6' },
           "50%": { opacity: '0.8' },
         },
         aurora: {
           from: {
             backgroundPosition: "50% 50%, 50% 50%",
           },
           to: {
             backgroundPosition: "350% 50%, 350% 50%",
           },
         },
         "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" }, },
         "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" }, },
      },
      animation: {
          "pulse-subtle": "pulse-subtle 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          'loader-spin': 'loaderSpin 3s ease-in-out infinite',
          "aurora": "aurora 60s linear infinite",
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
      require('tailwind-scrollbar'),
      require("tailwindcss-animate"), // Needed for Radix UI component animations
      // ... other plugins ...
  ],
}
export default config