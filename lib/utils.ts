import type { ArticleBlock } from "@/lib/types";

export const categories = [
  "Pitching",
  "Hitting",
  "Biomechanics",
  "Training",
  "Technology",
  "Case Studies"
] as const;

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "Draft";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function blockText(block: ArticleBlock): string {
  switch (block.type) {
    case "heading":
    case "paragraph":
      return block.text;
    case "rich_text":
      return block.html.replace(/<[^>]*>/g, " ");
    case "pull_quote":
      return block.quote;
    case "key_takeaway":
    case "biomech_note":
      return `${block.title ?? ""} ${block.body}`;
    case "data_callout":
      return `${block.eyebrow ?? ""} ${block.title} ${block.body} ${(block.stats ?? [])
        .map((stat) => `${stat.label} ${stat.value} ${stat.context ?? ""}`)
        .join(" ")}`;
    case "stat_grid":
      return block.stats.map((stat) => `${stat.label} ${stat.value} ${stat.context ?? ""}`).join(" ");
    case "two_column":
      return [...block.left, ...block.right].map(blockText).join(" ");
    case "numbered_list":
    case "bullet_list":
      return block.items.join(" ");
    case "cta_box":
      return `${block.title} ${block.body}`;
    case "references":
      return block.items.map((item) => item.label).join(" ");
    default:
      return "";
  }
}

export function estimateReadTime(blocks: ArticleBlock[]) {
  const words = blocks
    .map(blockText)
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 220));
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function embedUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${parsed.pathname.replace("/", "")}`;
    }
    if (parsed.hostname.includes("vimeo.com")) {
      return `https://player.vimeo.com/video/${parsed.pathname.replace("/", "")}`;
    }
    if (parsed.hostname.includes("loom.com") && parsed.pathname.includes("/share/")) {
      return url.replace("/share/", "/embed/");
    }
    return url;
  } catch {
    return url;
  }
}
