import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      config: {
        darkMode: "class", // 🌙 enable manual dark mode via .dark class
        theme: {
          extend: {},
        },
        content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
      },
    }),
  ],
});
