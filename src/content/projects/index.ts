import { marked } from "marked";
import { asset } from "@/lib/asset";

/**
 * 作品文档加载器
 * ------------------------------------------------------------------
 * 放在本目录的每个 .md 就是一个作品详情文档（frontmatter + Markdown）。
 * 文件名（去掉扩展名）就是 doc 标识，例如 raycast.md → "raycast"。
 * 以下划线开头的文件（_TEMPLATE.md）不会被加载。
 */

export interface ProjectHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface ProjectDoc {
  slug: string;
  title: string;
  year: string;
  category: string;
  role: string;
  cover: string;
  html: string;
  headings: ProjectHeading[];
}

type Frontmatter = Record<string, string>;

function parseFrontmatter(source: string): { data: Frontmatter; body: string } {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: source };

  const data: Frontmatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const item = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!item) continue;
    let value = item[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[item[1]] = value;
  }

  return { data, body: source.slice(match[0].length) };
}

function extractHeadings(body: string): Array<{ text: string; level: 2 | 3 }> {
  const list: Array<{ text: string; level: 2 | 3 }> = [];
  let fenced = false;

  for (const line of body.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const item = line.match(/^(#{2,3})\s+(.+?)\s*$/);
    if (item) {
      list.push({
        text: item[2].replace(/[*_`]/g, "").trim(),
        level: item[1].length === 3 ? 3 : 2,
      });
    }
  }

  return list;
}

function slugify(text: string): string {
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

const sources = import.meta.glob("./*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const projectDocs: Record<string, ProjectDoc> = {};

for (const [path, source] of Object.entries(sources)) {
  const slug = path.replace(/^\.\//, "").replace(/\.md$/, "");
  if (slug.startsWith("_")) continue;

  const { data, body } = parseFrontmatter(source);
  const used = new Set<string>();
  const headings: ProjectHeading[] = extractHeadings(body).map((heading) => {
    const base = slugify(heading.text);
    let id = base;
    let n = 2;
    while (used.has(id)) {
      id = `${base}-${n}`;
      n += 1;
    }
    used.add(id);
    return { id, text: heading.text, level: heading.level };
  });

  let html = marked.parse(body, { gfm: true }) as string;
  let index = 0;
  html = html.replace(/<h([23])>/g, (_match, level: string) => {
    const heading = headings[index];
    index += 1;
    return heading ? `<h${level} id="${heading.id}">` : `<h${level}>`;
  });

  // 正文里的绝对图片路径同样要带 BASE_URL（GitHub Pages 项目页）
  html = html.replace(/src="(\/[^"]+)"/g, (_match, src: string) => `src="${asset(src)}"`);

  projectDocs[slug] = {
    slug,
    title: data.title ?? slug,
    year: data.year ?? "",
    category: data.category ?? "",
    role: data.role ?? "",
    cover: data.cover ?? "",
    html,
    headings,
  };
}
