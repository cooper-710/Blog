import type { Article, ArticleStatus } from "@/lib/types";
import { estimateReadTime, slugify } from "@/lib/utils";

export function buildArticlePayload(article: Article, status?: ArticleStatus) {
  const nextStatus = status ?? article.status;
  const isPublishing = nextStatus === "published";

  return {
    title: article.title,
    subtitle: article.subtitle,
    slug: slugify(article.slug || article.title),
    excerpt: article.excerpt || article.subtitle || "",
    category: article.category,
    tags: article.tags,
    author_name: article.author_name || "TJ Galenti",
    hero_image_url: article.hero_image_url || null,
    hero_image_alt: article.hero_image_alt || article.title,
    status: nextStatus,
    featured: isPublishing ? true : article.featured,
    read_time_minutes: estimateReadTime(article.content_blocks),
    seo_title: article.seo_title || article.title,
    seo_description: article.seo_description || article.subtitle || article.excerpt || "",
    content_blocks: article.content_blocks,
    published_at: isPublishing ? article.published_at ?? new Date().toISOString() : article.published_at
  };
}

export async function clearFeaturedExcept(
  supabase: ReturnType<typeof import("@/lib/supabase").createSupabaseBrowserClient>,
  articleId: string
) {
  const { error } = await supabase.from("articles").update({ featured: false }).neq("id", articleId);
  if (error) throw error;
}
