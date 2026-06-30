import { ArticleFooterCta } from "@/components/article/ArticleFooterCta";
import { ArticleRenderer } from "@/components/article/ArticleRenderer";
import { ArticleMobileToc } from "@/components/article/ArticleMobileToc";
import { ArticleSidebar } from "@/components/article/ArticleSidebar";
import type { PreviewViewport } from "@/lib/preview-viewport";
import type { ArticleBlock } from "@/lib/types";

type Props = {
  blocks: ArticleBlock[];
  viewport?: PreviewViewport;
};

export function ArticleLayout({ blocks, viewport }: Props) {
  if (!viewport) {
    return (
      <section className="editorial-container grid gap-10 py-12 lg:grid-cols-[minmax(0,760px)_280px] lg:items-start">
        <article className="min-w-0 w-full">
          <ArticleMobileToc blocks={blocks} />
          <ArticleRenderer blocks={blocks} />
          <ArticleFooterCta />
        </article>
        <ArticleSidebar blocks={blocks} />
      </section>
    );
  }

  if (viewport === "desktop") {
    return (
      <section className="editorial-container grid grid-cols-[minmax(0,760px)_280px] items-start gap-10 py-12">
        <article className="min-w-0 w-full">
          <ArticleRenderer blocks={blocks} />
        </article>
        <ArticleSidebar blocks={blocks} viewport={viewport} />
      </section>
    );
  }

  return (
    <section className="w-full px-4 py-10">
      <article className="mx-auto w-full min-w-0">
        <ArticleMobileToc blocks={blocks} viewport={viewport} />
        <ArticleRenderer blocks={blocks} />
        <ArticleFooterCta viewport={viewport} />
      </article>
    </section>
  );
}
