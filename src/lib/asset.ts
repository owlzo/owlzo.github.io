/**
 * 资源路径前缀
 * ------------------------------------------------------------------
 * GitHub Pages 的项目页部署在 /<repo>/ 下，绝对路径 /covers/x.svg 会失效。
 * 所有运行时引用的静态资源都过这一层，自动带上 Vite 的 BASE_URL。
 */
export function asset(path: string): string {
  if (!path) return path;
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${path.replace(/^\//, "")}`.replace(/([^:]\/)\/+/g, "$1");
}
