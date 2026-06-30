import { ArticlePreviewCard } from "@/components/article/ArticlePreviewCard";
import type { Article } from "@/lib/types";

export function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  return (
    <ArticlePreviewCard
      article={article}
      featured={featured}
      label={featured ? "Featured article" : undefined}
    />
  );
}
