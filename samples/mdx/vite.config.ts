import { defineConfig } from "vite";
import contentCollections from "@content-collections/vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react(), contentCollections()],
  server: {
    port: 5175,
  }
});
