import type { Metadata } from "next";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticlesExplorer } from "@/components/article/ArticlesExplorer";
import { getPublishedArticles } from "@/lib/articles";
import type { ArticleCategory } from "@/lib/types";
import { categories } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Baseball biomechanics, motion capture, hitting, pitching, training, technology, and case study articles from TJ Galenti."
};

type Props = {
  searchParams: Promise<{ category?: string }>;
};

function resolveInitialCategory(value?: string): ArticleCategory | "All" {
  if (!value) return "All";
  return categories.includes(value as ArticleCategory) ? (value as ArticleCategory) : "All";
}

export default async function ArticlesPage({ searchParams }: Props) {
  const { category: categoryParam } = await searchParams;
  const initialCategory = resolveInitialCategory(categoryParam);
  const articles = await getPublishedArticles();
  const featured = articles.find((article) => article.featured) ?? articles[0];
  const remaining = articles.filter((article) => article.id !== featured?.id);

  return (
    <main>
      {featured && (
        <section className="editorial-container py-10 sm:py-12">
          <div className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal">
            <span>Featured article</span>
            <span className="h-px w-10 bg-stone" />
          </div>
          <ArticleCard article={featured} featured />
        </section>
      )}

      <ArticlesExplorer
        articles={remaining.length ? remaining : articles}
        initialCategory={initialCategory}
      />
    </main>
  );
}
