import contentCollections from "@content-collections/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), contentCollections()],
});
