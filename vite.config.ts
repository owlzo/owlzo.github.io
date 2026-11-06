import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * GitHub Pages 说明
 * ------------------------------------------------------------------
 * - 用户页（仓库名 <user>.github.io）：base 用 "/"
 * - 项目页（任意仓库名）：base 用 "/<repo>/"
 * 部署时由 .github/workflows/deploy.yml 通过 VITE_BASE 注入，本地开发默认 "/"。
 */
export default defineConfig({
  base: process.env.VITE_BASE ?? "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
