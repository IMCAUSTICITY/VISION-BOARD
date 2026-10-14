import type { Config } from "tailwindcss"
export default {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    fontFamily: { sans: ["var(--font-body)", "system-ui"], display: ["var(--font-display)", "serif"] },
    colors: {
      border: "hsl(var(--border))", input: "hsl(var(--input))", ring: "hsl(var(--ring))",
      background: "hsl(var(--background))", foreground: "hsl(var(--foreground))",
      primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
      secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
      muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
      accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
      destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
      card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
    },
    borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
    boxShadow: { soft: "0 1px 2px rgba(80,60,160,.04), 0 8px 24px -12px rgba(80,60,160,.12)" },
  } },
  plugins: [require("tailwindcss-animate")],
} satisfies Config
