/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#00A86B",
        secondary: "#FF6B2B",
        bg: "#FFFFFF",
        surface: "#F8FAFC",
        text: "#1A1A2E",
        success: "#10B981",
        error: "#EF4444",
        warning: "#F59E0B"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.08)"
      },
      fontFamily: {
        /* Polices système uniquement : bundle léger, rendu immédiat (mobile / réseau faible). */
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
      }
    }
  },
  plugins: []
};

