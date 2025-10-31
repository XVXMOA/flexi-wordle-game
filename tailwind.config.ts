import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Game-specific colors
        correct: {
          DEFAULT: "hsl(var(--correct))",
          foreground: "hsl(var(--correct-foreground))",
        },
        present: {
          DEFAULT: "hsl(var(--present))",
          foreground: "hsl(var(--present-foreground))",
        },
        absent: {
          DEFAULT: "hsl(var(--absent))",
          foreground: "hsl(var(--absent-foreground))",
        },
        empty: {
          DEFAULT: "hsl(var(--empty))",
          foreground: "hsl(var(--empty-foreground))",
        },
        
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "liquid-dialog-in": {
          "0%": {
            transform: "translate(-32%, -32%) scale(0.9)",
            opacity: "0",
            filter: "blur(10px) saturate(115%)",
          },
          "60%": {
            transform: "translate(-47%, -47%) scale(1.02)",
            opacity: "1",
            filter: "blur(1.5px) saturate(103%)",
          },
          "100%": {
            transform: "translate(-50%, -50%) scale(1)",
            opacity: "1",
            filter: "blur(0) saturate(100%)",
          },
        },
        "liquid-dialog-out": {
          "0%": {
            transform: "translate(-50%, -50%) scale(1)",
            opacity: "1",
            filter: "blur(0) saturate(100%)",
          },
          "40%": {
            transform: "translate(-44%, -44%) scale(0.95)",
            filter: "blur(4px) saturate(108%)",
          },
          "100%": {
            transform: "translate(12%, 16%) scale(0.82)",
            opacity: "0",
            filter: "blur(12px) saturate(120%)",
          },
        },
        "liquid-overlay-in": {
          "0%": {
            opacity: "0",
            backdropFilter: "blur(0px)",
          },
          "100%": {
            opacity: "1",
            backdropFilter: "blur(4px)",
          },
        },
        "liquid-overlay-out": {
          "0%": {
            opacity: "1",
            backdropFilter: "blur(4px)",
          },
          "100%": {
            opacity: "0",
            backdropFilter: "blur(0px)",
          },
        },
        "liquid-orb": {
          "0%": {
            transform: "translate3d(-20%, -10%, 0) scale(1)",
          },
          "50%": {
            transform: "translate3d(12%, 14%, 0) scale(1.2)",
          },
          "100%": {
            transform: "translate3d(-18%, -6%, 0) scale(1)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "liquid-dialog-in": "liquid-dialog-in 0.55s cubic-bezier(0.22, 0.61, 0.36, 1)",
        "liquid-dialog-out": "liquid-dialog-out 0.5s cubic-bezier(0.55, 0.03, 0.52, 0.96) forwards",
        "liquid-overlay-in": "liquid-overlay-in 0.45s ease",
        "liquid-overlay-out": "liquid-overlay-out 0.35s ease forwards",
        "liquid-orb": "liquid-orb 8s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
