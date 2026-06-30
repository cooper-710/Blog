import type { Article } from "@/lib/types";

/** Standard cover ratio for article preview cards — match exported hero assets to this. */
export const ARTICLE_CARD_IMAGE_ASPECT = 3 / 2;

export function articlePreviewBody(article: Article, sentenceCount = 2) {
  const source = (article.excerpt || article.subtitle || "").replace(/\s+/g, " ").trim();
  if (!source) return "";

  const sentences =
    source.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((part) => part.trim()).filter(Boolean) ?? [source];

  return sentences.slice(0, sentenceCount).join(" ").trim();
}
