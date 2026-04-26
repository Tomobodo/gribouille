import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    // Pour le dev local : firebase emulators:start --only functions,hosting
    // Ou remplace TON_PROJECT_ID par ton vrai ID Firebase
    proxy: {
      "^/api/.*": "http://127.0.0.1:5001/gribouille-ad5a7/europe-west1/api",
      "^/s/.*": "http://127.0.0.1:5001/gribouille-ad5a7/europe-west1/api",
    },
  },
});
