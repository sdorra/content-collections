import { defineConfig } from "vite";
import contentCollections from "@content-collections/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), contentCollections()],
});
