import type { ArticleBlock } from "@/lib/types";

export type ArticleHeading = {
  text: string;
  level: number;
  id: string;
};

export function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
}

function uniqueHeadingId(text: string, used: Map<string, number>) {
  const base = slugifyHeading(text) || "section";
  const count = used.get(base) ?? 0;
  used.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}

export function getHeadingsFromBlocks(blocks: ArticleBlock[]): ArticleHeading[] {
  const headings: ArticleHeading[] = [];
  const used = new Map<string, number>();

  for (const block of blocks) {
    if (block.type === "heading") {
      headings.push({
        text: block.text,
        level: block.level ?? 2,
        id: uniqueHeadingId(block.text, used)
      });
      continue;
    }

    if (block.type === "rich_text") {
      const matches = block.html.matchAll(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi);
      for (const match of matches) {
        const text = stripHtml(match[3] ?? "");
        if (!text) continue;
        headings.push({
          text,
          level: Number(match[1]),
          id: uniqueHeadingId(text, used)
        });
      }
    }
  }

  return headings;
}

export function addHeadingIdsToHtml(html: string) {
  const used = new Map<string, number>();

  return html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (full, level: string, attrs: string, content: string) => {
    if (/\sid\s*=/.test(attrs)) return full;
    const text = stripHtml(content);
    if (!text) return full;
    const id = uniqueHeadingId(text, used);
    return `<h${level}${attrs} id="${id}">${content}</h${level}>`;
  });
}
