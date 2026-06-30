import { ArticlePreviewCard } from "@/components/article/ArticlePreviewCard";
import { RecentArticlesScrollRail } from "@/components/home/RecentArticlesScrollRail";
import type { Article } from "@/lib/types";

const SCROLL_RAIL_MIN = 4;

type RecentArticlesRailProps = {
  articles: Article[];
};

export function RecentArticlesRail({ articles }: RecentArticlesRailProps) {
  if (!articles.length) return null;

  const useScroller = articles.length >= SCROLL_RAIL_MIN;

  return (
    <section className="mt-10 sm:mt-12">
      <h3 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">Recent Articles</h3>

      {useScroller ? (
        <RecentArticlesScrollRail articles={articles} />
      ) : (
        <div className="mt-5 grid gap-6 sm:mt-6 sm:gap-7 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <ArticlePreviewCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </section>
  );
}
