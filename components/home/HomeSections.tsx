import Image from "next/image";
import Link from "next/link";
import { ArticlePreviewCard } from "@/components/article/ArticlePreviewCard";
import { RecentArticlesRail } from "@/components/home/RecentArticlesRail";
import { focusAreas } from "@/lib/focus-areas";
import { SERVICE_TOPICS_LINE } from "@/lib/site-copy";
import type { Article } from "@/lib/types";

const credentials = [
  "Biomechanist",
  "Data Scientist",
  "CSCS",
  "Former Division I Player",
  "PhD Candidate"
];

const athleteExperience = [
  "Major League players",
  "All-Stars",
  "Gold Glovers",
  "College athletes",
  "Amateurs"
];

function CredentialChips() {
  return (
    <div className="border-t border-stone/80 pt-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Background</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-charcoal/84">
        {credentials.join(" · ")}
      </p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal/75">Worked With</p>
      <p className="mt-3 text-xs font-semibold leading-6 text-charcoal/55 sm:text-sm">
        {athleteExperience.join(" · ")}
      </p>
    </div>
  );
}

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-stone/80 bg-ivory">
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <Image
          src="/tj-galenti.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-scale-x-100 object-cover object-[62%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ivory/45 via-ivory/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ivory/50 via-transparent to-transparent" />
      </div>

      <div className="editorial-container relative z-10 flex flex-col gap-4 py-8 sm:gap-5 sm:py-10 lg:min-h-[calc(100vh-64px)] lg:flex-row lg:items-center lg:py-20">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-stone/70 shadow-[0_16px_50px_rgba(17,17,17,0.08)] sm:aspect-[5/6] lg:hidden">
          <Image
            src="/tj-galenti.png"
            alt="TJ Galenti"
            fill
            priority
            sizes="(max-width: 1023px) 420px, 0px"
            className="-scale-x-100 object-cover object-[58%_18%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ivory/55 via-transparent to-ivory/10" />
        </div>

        <div className="home-hero-card w-full rounded-[24px] border border-stone/60 bg-ivory p-5 shadow-[0_20px_70px_rgba(17,17,17,0.08)] sm:rounded-[30px] sm:p-7 lg:max-w-3xl lg:rounded-[34px] lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">TJ Galenti / baseball biomechanics</p>
          <h1 className="mt-4 font-serif text-[2.65rem] leading-[0.98] text-ink text-balance sm:mt-5 sm:text-6xl lg:text-8xl">
            Baseball Biomechanics
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-charcoal/78 sm:mt-7 sm:text-xl">
            Athletic performance, explained through biomechanics and applied data with TJ Galenti.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap">
            <Link
              className="focus-ring inline-flex justify-center rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory shadow-[0_16px_36px_rgba(17,17,17,0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-clay sm:justify-start"
              href="/articles"
            >
              Read Articles
            </Link>
            <Link
              className="focus-ring inline-flex justify-center rounded-full border border-stone bg-ivory/70 px-6 py-3 text-sm font-semibold text-ink transition duration-200 hover:-translate-y-0.5 hover:border-clay hover:text-clay sm:justify-start"
              href="/connect"
            >
              Connect
            </Link>
          </div>
          <div className="mt-8 max-w-2xl sm:mt-10">
            <CredentialChips />
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturedArticleCard({ article }: { article: Article }) {
  return <ArticlePreviewCard article={article} featured label="Featured article" />;
}

export function LatestArticles({
  featured,
  supportingArticles
}: {
  featured?: Article;
  supportingArticles: Article[];
}) {
  if (!featured) return null;

  return (
    <section className="editorial-container py-10 sm:py-12">
      <div className="mb-6 flex items-end justify-between gap-6 sm:mb-8">
        <div>
          <h2 className="font-serif text-3xl leading-tight text-ink sm:text-5xl">Featured Article</h2>
        </div>
        <Link
          className="focus-ring group hidden rounded-full border border-stone bg-ivory/70 px-5 py-3 text-sm font-semibold text-charcoal transition hover:-translate-y-0.5 hover:border-clay hover:text-clay sm:inline-flex"
          href="/articles"
        >
          All articles
        </Link>
      </div>
      <FeaturedArticleCard article={featured} />
      <RecentArticlesRail articles={supportingArticles} />
    </section>
  );
}

function FocusAreaImage({ image, imagePosition }: { image: string; imagePosition: string }) {
  return (
    <div className="relative h-[92px] w-full max-w-[260px] overflow-hidden rounded-[24px] border border-stone/75 bg-ivory shadow-[0_12px_34px_rgba(17,17,17,0.08)]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover transition duration-500 group-hover:scale-[1.04]"
        style={{
          backgroundImage: `url("${image}")`,
          backgroundPosition: imagePosition
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(244,239,230,0.16),rgba(244,239,230,0)_55%)]" />
    </div>
  );
}

export function AreasOfFocus() {
  return (
    <section className="py-14">
      <div className="editorial-container">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-serif text-5xl leading-tight text-ink">Areas of Focus</h2>
          <Link
            href="/articles"
            className="focus-ring rounded-full border border-stone bg-ivory/70 px-5 py-3 text-sm font-semibold text-charcoal transition hover:-translate-y-0.5 hover:border-clay hover:text-clay"
          >
            All articles
          </Link>
        </div>
        <div className="overflow-hidden rounded-[30px] border border-stone/80 bg-paper shadow-[0_18px_55px_rgba(17,17,17,0.05)]">
          {focusAreas.map((area) => (
            <Link
              key={area.category}
              href={`/articles?category=${encodeURIComponent(area.category)}`}
              className="focus-ring group grid gap-4 border-b border-stone/70 px-6 py-5 transition duration-200 last:border-b-0 hover:bg-ivory sm:grid-cols-[minmax(220px,0.8fr)_minmax(180px,1fr)_auto] sm:items-center sm:px-8"
            >
              <h3 className="font-serif text-3xl leading-tight text-ink transition group-hover:text-clay">{area.title}</h3>
              <div className="flex justify-start sm:justify-center">
                <FocusAreaImage image={area.image} imagePosition={area.imagePosition} />
              </div>
              <span className="text-sm font-semibold text-clay transition group-hover:translate-x-1">
                Articles &rarr;
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeCta() {
  return (
    <section id="connect" className="editorial-container py-16">
      <div className="relative overflow-hidden rounded-[36px] border border-stone bg-navy p-8 text-ivory shadow-soft sm:p-10 lg:p-12">
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Contact</p>
            <h2 className="mt-4 max-w-3xl font-serif text-5xl leading-tight text-balance">
              Connect with me
            </h2>
            <p className="mt-5 max-w-2xl text-sm font-medium tracking-wide text-ivory/76">
              {SERVICE_TOPICS_LINE}
            </p>
          </div>
          <Link
            href="/connect"
            className="focus-ring inline-flex rounded-full bg-ivory px-6 py-3 text-sm font-semibold text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-clay hover:text-ivory"
          >
            Connect
          </Link>
        </div>
      </div>
    </section>
  );
}
