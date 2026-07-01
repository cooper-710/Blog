"use client";

import { useMemo, useState } from "react";
import { ArticleCard } from "@/components/article/ArticleCard";
import { articleMatchesQuery } from "@/lib/article-search";
import type { Article, ArticleCategory } from "@/lib/types";
import { categories } from "@/lib/utils";

type ArticlesExplorerProps = {
  articles: Article[];
  initialCategory?: ArticleCategory | "All";
};

export function ArticlesExplorer({ articles, initialCategory = "All" }: ArticlesExplorerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ArticleCategory | "All">(initialCategory);

  const filtered = useMemo(() => {
    return articles.filter((article) => {
      const categoryMatch = category === "All" || article.category === category;
      return categoryMatch && articleMatchesQuery(article, query);
    });
  }, [articles, category, query]);

  const hasFilters = query.trim().length > 0 || category !== "All";

  return (
    <section className="editorial-container border-t border-stone py-10 sm:py-12">
      <div className="mb-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal">
        <span>Archives</span>
        <span className="h-px w-10 bg-stone" />
      </div>

      <div className="space-y-5">
        <div className="relative max-w-2xl">
          <label className="sr-only" htmlFor="article-search">
            Search archives
          </label>
          <span
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-charcoal/45"
          >
            ⌕
          </span>
          <input
            id="article-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search titles, motion capture, biomechanics, tags..."
            className="focus-ring w-full rounded-full border border-stone bg-paper py-3 pl-11 pr-11 text-base text-ink placeholder:text-charcoal/45"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="focus-ring absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-lg leading-none text-charcoal/55 transition hover:bg-stone/35 hover:text-ink"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2" aria-label="Category filters">
          {(["All", ...categories] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`focus-ring rounded-full border px-4 py-2 text-sm font-semibold transition ${
                category === item
                  ? "border-ink bg-ink text-ivory"
                  : "border-stone bg-ivory/70 text-charcoal hover:border-clay hover:text-clay"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm font-medium text-charcoal/55">
        {filtered.length} article{filtered.length === 1 ? "" : "s"}
        {hasFilters ? " matching your filters" : ""}
      </p>

      <div className="mt-8 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {!filtered.length && (
        <div className="mt-8 rounded-[28px] border border-stone bg-paper p-8 text-center text-charcoal/70">
          No articles match that search. Try another keyword or category.
        </div>
      )}
    </section>
  );
}
