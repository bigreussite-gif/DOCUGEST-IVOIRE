import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "logo-docugest-ivoire.png", "favicon.svg", "icons.svg"],
      manifest: {
        name: "DocuGest Ivoire",
        short_name: "DocuGest",
        description: "Factures, devis et bulletins — même hors ligne.",
        theme_color: "#00A86B",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        lang: "fr",
        icons: [
          { src: "/favicon.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "/favicon.png", sizes: "512x512", type: "image/png", purpose: "any" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api"),
            handler: "NetworkOnly"
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  server: {
    port: 5173,
    strictPort: true,
    open: true
  }
});
