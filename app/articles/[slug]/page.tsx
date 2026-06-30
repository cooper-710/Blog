import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleHero } from "@/components/article/ArticleHero";
import { ArticleLayout } from "@/components/article/ArticleLayout";
import { ArticleCard } from "@/components/article/ArticleCard";
import { getArticleBySlug, getPublishedArticles } from "@/lib/articles";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article not found"
    };
  }

  const title = article.seo_title || article.title;
  const description = article.seo_description || article.excerpt || article.subtitle || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.published_at ?? undefined,
      authors: [article.author_name],
      images: article.hero_image_url ? [{ url: article.hero_image_url, alt: article.hero_image_alt || article.title }] : undefined
    }
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = (await getPublishedArticles())
    .filter((candidate) => candidate.id !== article.id && candidate.category === article.category)
    .slice(0, 2);

  return (
    <main>
      <ArticleHero article={article} />
      <ArticleLayout blocks={article.content_blocks} />

      {!!related.length && (
        <section className="border-t border-stone py-14">
          <div className="editorial-container">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Related</p>
            <div className="mt-6 grid gap-7 lg:grid-cols-2">
              {related.map((item) => (
                <ArticleCard key={item.id} article={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
