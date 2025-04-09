import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel(),
  integrations: [react()],
});
