import { AreasOfFocus, HomeCta, HomeHero, LatestArticles } from "@/components/home/HomeSections";
import { getPublishedArticles } from "@/lib/articles";

export default async function HomePage() {
  const articles = await getPublishedArticles();
  const sortedArticles = [...articles].sort((a, b) => {
    const aTime = new Date(a.published_at ?? a.created_at).getTime();
    const bTime = new Date(b.published_at ?? b.created_at).getTime();
    return bTime - aTime;
  });
  const featured = sortedArticles[0];
  const supportingArticles = sortedArticles.slice(1, 11);

  return (
    <main>
      <HomeHero />
      <LatestArticles featured={featured} supportingArticles={supportingArticles} />
      <AreasOfFocus />
      <HomeCta />
    </main>
  );
}
