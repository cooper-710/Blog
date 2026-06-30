import Image from "next/image";
import Link from "next/link";
import { articlePreviewBody, ARTICLE_CARD_IMAGE_ASPECT } from "@/lib/article-preview";
import type { Article } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { TechnicalVisual } from "@/components/TechnicalVisual";

type ArticlePreviewCardProps = {
  article: Article;
  featured?: boolean;
  label?: string;
};

function ReadMoreLink({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold text-clay transition group-hover:gap-2 ${className}`}
    >
      Click to read more
      <span aria-hidden className="text-base leading-none">
        →
      </span>
    </span>
  );
}

function ArticleCardImage({
  article,
  featured = false
}: {
  article: Article;
  featured?: boolean;
}) {
  return (
    <div
      className={
        featured
          ? "relative aspect-[3/2] w-full overflow-hidden rounded-xl bg-paper lg:max-h-[340px] lg:min-h-[280px]"
          : "relative w-full overflow-hidden rounded-xl bg-paper"
      }
      style={featured ? undefined : { aspectRatio: String(ARTICLE_CARD_IMAGE_ASPECT) }}
    >
      {article.hero_image_url ? (
        <Image
          src={article.hero_image_url}
          alt={article.hero_image_alt || article.title}
          fill
          sizes={
            featured
              ? "(min-width: 1024px) 480px, 100vw"
              : "(min-width: 1024px) 480px, 100vw"
          }
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full items-center justify-center p-6">
          <TechnicalVisual label={article.category} />
        </div>
      )}
    </div>
  );
}

function FeaturedArticlePreviewCard({ article, label }: { article: Article; label?: string }) {
  const previewBody = articlePreviewBody(article);

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="focus-ring group grid w-full grid-cols-1 overflow-hidden rounded-xl border border-stone/80 bg-paper shadow-[0_12px_40px_rgba(17,17,17,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-teal/70 hover:shadow-[0_24px_70px_rgba(17,17,17,0.1)] max-lg:hover:translate-y-0 lg:grid-cols-[minmax(300px,44%)_1fr] lg:items-stretch lg:rounded-2xl lg:shadow-[0_18px_60px_rgba(17,17,17,0.06)]"
    >
      <div className="p-3 lg:flex lg:items-center lg:p-5 lg:pr-3">
        <ArticleCardImage article={article} featured />
      </div>

      <div className="flex flex-col justify-between px-4 pb-5 pt-1 sm:px-5 sm:pb-6 lg:p-8 lg:pl-2">
        <div>
          {label && (
            <span className="inline-block rounded-md bg-clay/12 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-clay">
              {label}
            </span>
          )}

          <h2
            className={`font-serif text-[1.65rem] leading-tight text-ink text-balance transition group-hover:text-clay sm:text-3xl lg:text-[2.35rem] lg:leading-[1.08] ${
              label ? "mt-3 sm:mt-4" : ""
            }`}
          >
            {article.title}
          </h2>

          <div className="mt-4 text-base leading-7 text-charcoal/74 lg:mt-5 lg:text-[1.05rem] lg:leading-8">
            {previewBody && <p>{previewBody}</p>}
          </div>
        </div>

        <div className="mt-5 border-t border-dashed border-stone/90 pt-4 lg:mt-6">
          <ReadMoreLink />
          <p className="mt-3 text-sm font-medium text-charcoal/55">
            {formatDate(article.published_at || article.updated_at)}
            <span className="mx-2 text-stone" aria-hidden>
              ·
            </span>
            {article.read_time_minutes} min read
          </p>
        </div>
      </div>
    </Link>
  );
}

function StandardArticlePreviewCard({ article, label }: { article: Article; label?: string }) {
  const previewBody = articlePreviewBody(article);

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="focus-ring group flex h-full w-full flex-col overflow-hidden rounded-xl border border-stone/80 bg-paper shadow-[0_10px_36px_rgba(17,17,17,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-teal/70 hover:shadow-[0_20px_60px_rgba(17,17,17,0.1)] max-lg:hover:translate-y-0 lg:rounded-2xl"
    >
      <div className="p-3 pb-0">
        <ArticleCardImage article={article} />
      </div>

      <div className="flex flex-1 flex-col px-4 pb-5 pt-0 sm:px-5 sm:pb-6 sm:pt-0">
        {label && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">{label}</p>
        )}

        <h2
          className={`font-serif text-xl leading-tight text-ink text-balance transition group-hover:text-clay sm:text-2xl lg:text-[1.75rem] ${
            label ? "mt-3" : ""
          }`}
        >
          {article.title}
        </h2>

        <div className="mt-4 flex-1 text-base leading-7 text-charcoal/74">
          {previewBody && <p>{previewBody}</p>}
          <ReadMoreLink className="mt-3" />
        </div>

        <p className="mt-5 text-sm font-medium text-charcoal/55">
          {formatDate(article.published_at || article.updated_at)}
          <span className="mx-2 text-stone" aria-hidden>
            ·
          </span>
          {article.read_time_minutes} min read
        </p>
      </div>
    </Link>
  );
}

export function ArticlePreviewCard({ article, featured = false, label }: ArticlePreviewCardProps) {
  if (featured) {
    return <FeaturedArticlePreviewCard article={article} label={label} />;
  }

  return <StandardArticlePreviewCard article={article} label={label} />;
}
