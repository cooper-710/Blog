import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SERVICE_TOPICS_LINE } from "@/lib/site-copy";

export const metadata: Metadata = {
  title: "About",
  description:
    "About TJ Galenti, baseball biomechanist, motion capture specialist, data scientist, CSCS, performance coach, former Division 1 player, PhD student in Biomedical Engineering, and CEO of Sequence Biolab."
};

const credentials = [
  "CEO of Sequence Biolab",
  "Biomechanist",
  "Data scientist",
  "Certified Strength and Conditioning Specialist",
  "Baseball performance coach",
  "Former Division 1 baseball player",
  "PhD student in Biomedical Engineering"
];

export default function AboutPage() {
  return (
    <main className="bg-ivory pb-16 pt-8 sm:pb-20">
      <section className="editorial-container overflow-hidden rounded-[36px] border border-stone/80 bg-paper p-3 shadow-soft sm:rounded-[40px]">
        <div className="grid gap-3 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[30px] border border-stone/70 bg-ivory/82 p-7 sm:p-10 lg:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">About TJ Galenti</p>
            <h1 className="mt-5 font-serif text-6xl leading-[0.98] text-ink text-balance sm:text-8xl">
              TJ Galenti
            </h1>
            <p className="mt-7 max-w-2xl text-xl leading-8 text-charcoal/78">
              I&apos;m a baseball biomechanist, data scientist, Certified Strength and Conditioning Specialist, performance
              coach, former Division 1 baseball player, and PhD student in Biomedical Engineering.
            </p>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-charcoal/76">
              I&apos;m also the CEO of Sequence Biolab, a baseball performance, biomechanics, and analytics company.
            </p>
          </div>

          <figure className="relative min-h-[340px] overflow-hidden rounded-[30px] border border-stone/70 bg-paper lg:h-full lg:min-h-0">
            <Image
              src="/tj-sequence-biolab-about.png"
              alt="TJ Galenti reviewing athlete performance data"
              fill
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover object-[42%_center]"
            />
          </figure>
        </div>
      </section>

      <section className="editorial-container mt-8 grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-stretch">
        <aside className="flex h-full flex-col rounded-[36px] border border-stone/80 bg-paper p-7 shadow-[0_18px_55px_rgba(17,17,17,0.05)] sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Background</p>
          <div className="mt-5 flex flex-1 flex-col justify-between gap-3">
            {credentials.map((credential) => (
              <div
                key={credential}
                className="rounded-full border border-stone/60 bg-ivory px-4 py-3 text-base font-semibold text-ink"
              >
                {credential}
              </div>
            ))}
          </div>
        </aside>

        <section className="flex h-full flex-col rounded-[36px] border border-stone/80 bg-paper p-7 shadow-[0_18px_55px_rgba(17,17,17,0.05)] sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">The Work</p>
          <div className="mt-5 space-y-6 text-lg leading-8 text-charcoal/82">
            <p>
              My work is built around motion capture, applied data science, and in-person coaching. I use biomechanical
              assessments, movement screens, swing and throwing data, strength and training context, and on-field work
              to understand what is driving a player&apos;s performance.
            </p>
            <p>
              Through Sequence Biolab, I work with hitters, pitchers, coaches, and organizations across professional,
              college, and player development settings. That has included Major League players, All-Stars, Silver
              Sluggers, Gold Glovers, high-level college athletes, and developing players. The work can include full
              biomechanical reports, player evaluations, training direction, throwing and hitting assessments, and
              ongoing performance support.
            </p>
            <p>
              The goal is to turn detailed, high-level information into better decisions. Modern performance technology
              gives us an overwhelming amount of data, but if you cannot interpret it properly and apply it to the
              athlete, what is the point?
            </p>
          </div>
        </section>
      </section>

      <section className="editorial-container mt-8">
        <div className="rounded-[36px] border border-stone/80 bg-paper p-7 text-center shadow-[0_18px_55px_rgba(17,17,17,0.05)] sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Why</p>
          <div className="mx-auto mt-5 max-w-3xl space-y-6">
            <p className="text-xl leading-8 text-charcoal/84">
              I write these articles to share complex concepts in baseball biomechanics, motion capture, training,
              player development, hitting, pitching, and applied data with the depth they deserve.
            </p>
            <p className="text-lg leading-8 text-charcoal/80">
              The more information we can understand, the better the development process becomes. The key is knowing how
              to turn that information into something specific to the player.
            </p>
            <p className="text-lg leading-8 text-charcoal/80">
              The purpose of this blog is to show how that process works. Each article is a way to explore performance in
              greater detail, explain how different pieces of information connect, and give players, coaches, parents,
              and organizations a clear look at the standard behind the work.
            </p>
          </div>
          <Link
            href="/articles"
            className="focus-ring mx-auto mt-8 inline-flex w-fit rounded-full border border-stone bg-ivory px-6 py-3 text-sm font-semibold text-ink transition duration-200 hover:-translate-y-0.5 hover:border-clay hover:text-clay"
          >
            Read articles
          </Link>
        </div>
      </section>

      <section className="editorial-container mt-8">
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
              className="focus-ring inline-flex w-fit rounded-full bg-ivory px-6 py-3 text-sm font-semibold text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-clay hover:text-ivory"
              href="/connect"
            >
              Connect
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
