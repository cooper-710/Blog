import type { Article, ArticleBlock } from "@/lib/types";

function blockText(block: ArticleBlock): string {
  switch (block.type) {
    case "heading":
    case "paragraph":
      return block.text;
    case "rich_text":
      return block.html.replace(/<[^>]+>/g, " ");
    case "pull_quote":
      return `${block.quote} ${block.attribution ?? ""}`;
    case "key_takeaway":
      return `${block.title ?? ""} ${block.body}`;
    case "data_callout":
      return `${block.eyebrow ?? ""} ${block.title} ${block.body}`;
    case "biomech_note":
      return `${block.title ?? ""} ${block.body}`;
    case "cta_box":
      return `${block.title} ${block.body}`;
    case "numbered_list":
    case "bullet_list":
      return block.items.join(" ");
    case "image":
      return `${block.alt ?? ""} ${block.caption ?? ""}`;
    case "image_pair":
      return block.images.map((image) => `${image.alt ?? ""} ${image.caption ?? ""}`).join(" ");
    case "video_embed":
      return `${block.title ?? ""} ${block.caption ?? ""}`;
    case "stat_grid":
      return block.stats.map((stat) => `${stat.label} ${stat.value} ${stat.context ?? ""}`).join(" ");
    case "references":
      return block.items.map((item) => item.label).join(" ");
    case "two_column":
      return [...block.left, ...block.right].map(blockText).join(" ");
    default:
      return "";
  }
}

export function articleSearchHaystack(article: Article): string {
  return [
    article.title,
    article.subtitle,
    article.excerpt,
    article.category,
    article.author_name,
    article.slug,
    ...article.tags,
    ...article.content_blocks.map(blockText)
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function articleMatchesQuery(article: Article, query: string): boolean {
  const terms = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (!terms.length) return true;

  const haystack = articleSearchHaystack(article);
  return terms.every((term) => haystack.includes(term));
}
