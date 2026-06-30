import Image from "next/image";
import type { PreviewViewport } from "@/lib/preview-viewport";
import { previewSubtitleClasses, previewTitleClasses } from "@/lib/preview-viewport";
import type { Article } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { TechnicalVisual } from "@/components/TechnicalVisual";

export function ArticleHero({
  article,
  preview = false,
  viewport
}: {
  article: Article;
  preview?: boolean;
  viewport?: PreviewViewport;
}) {
  return (
    <section
      className={`border-b border-stone bg-ivory ${viewport === "mobile" ? "py-8" : viewport === "tablet" ? "py-10" : "py-12 sm:py-16"}`}
    >
      <div
        className={`editorial-container grid ${
          viewport === "desktop" || !viewport
            ? "gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-end"
            : viewport === "tablet"
              ? "gap-8"
              : "gap-6"
        }`}
      >
        <div>
          {preview && (
            <div className="mb-5 inline-flex border border-clay/40 bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-clay">
              Preview
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal">
            <span>{article.category}</span>
            <span className="h-px w-8 bg-stone" />
            <span>{article.read_time_minutes} min read</span>
          </div>
          <h1
            className={
              viewport
                ? previewTitleClasses(viewport, "mt-5")
                : "mt-5 font-serif text-5xl leading-[0.98] text-ink text-balance sm:text-6xl lg:text-7xl"
            }
          >
            {article.title}
          </h1>
          {article.subtitle && (
            <p
              className={
                viewport
                  ? previewSubtitleClasses(viewport, "mt-5 max-w-2xl text-charcoal/78")
                  : "mt-6 max-w-2xl text-xl leading-8 text-charcoal/78"
              }
            >
              {article.subtitle}
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-charcoal/65">
            <span>{article.author_name}</span>
            <span className="h-1 w-1 rounded-full bg-teal" />
            <time dateTime={article.published_at || article.updated_at}>{formatDate(article.published_at || article.updated_at)}</time>
          </div>
        </div>

        <div
          className={`relative ${viewport === "mobile" ? "min-h-[220px]" : viewport === "tablet" ? "min-h-[280px]" : "min-h-[340px]"}`}
        >
          {article.hero_image_url ? (
            <Image
              src={article.hero_image_url}
              alt={article.hero_image_alt || ""}
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="border border-stone object-cover"
            />
          ) : (
            <TechnicalVisual label="Article visual" />
          )}
        </div>
      </div>
    </section>
  );
}
