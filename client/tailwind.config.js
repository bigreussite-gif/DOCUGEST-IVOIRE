/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#00A86B",
        "primary-dark": "#008a57",
        secondary: "#FF6B2B",
        "secondary-dark": "#e05520",
        bg: "#FFFFFF",
        surface: "#F8FAFC",
        text: "#1A1A2E",
        border: "#E2E8F0",
        success: "#10B981",
        error: "#EF4444",
        warning: "#F59E0B"
      },
      boxShadow: {
        xs: "0 1px 2px rgba(0,0,0,0.06)",
        soft: "0 4px 16px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
        card: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
        float: "0 8px 28px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
        modal: "0 20px 60px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.09)",
        "primary-glow": "0 4px 16px rgba(0,168,107,0.30)",
        "secondary-glow": "0 4px 16px rgba(255,107,43,0.30)"
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem"
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.22s cubic-bezier(0.22,1,0.36,1)",
        "slide-down": "slideDown 0.22s cubic-bezier(0.22,1,0.36,1)",
        "scale-in": "scaleIn 0.18s cubic-bezier(0.34,1.56,0.64,1)",
        "bounce-in": "bounceIn 0.3s cubic-bezier(0.34,1.56,0.64,1)"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.93)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        bounceIn: {
          "0%": { opacity: "0", transform: "scale(0.85)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        }
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(135deg, #00A86B 0%, #00c47e 100%)",
        "surface-gradient": "linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)"
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji"
        ],
        body: ["ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"]
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34,1.56,0.64,1)"
      }
    }
  },
  plugins: []
};
