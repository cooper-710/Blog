import Link from "next/link";
import type { PreviewViewport } from "@/lib/preview-viewport";
import { SERVICE_TOPICS_LINE } from "@/lib/site-copy";

export function ArticleFooterCta({ viewport }: { viewport?: PreviewViewport } = {}) {
  const sequenceUrl = process.env.NEXT_PUBLIC_SEQUENCE_URL || "https://www.instagram.com/sequencebiolab/";
  const isMobile = viewport === "mobile";

  return (
    <section
      className={`article-footer-cta mt-16 rounded-[28px] border border-stone bg-paper ${isMobile ? "p-6" : "p-8 sm:p-10"} ${viewport ? "" : "lg:hidden"}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Contact</p>
      <div
        className={`article-footer-cta-grid mt-4 grid gap-6 ${viewport === "mobile" || viewport === "tablet" ? "" : "md:grid-cols-[1fr_auto] md:items-end"}`}
      >
        <div>
          <h2 className={`font-serif leading-tight text-ink text-balance ${isMobile ? "text-3xl" : "text-4xl"}`}>
            Connect with me
          </h2>
          <p className="mt-3 text-sm font-medium tracking-wide text-charcoal/60">
            {SERVICE_TOPICS_LINE}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="focus-ring rounded-full bg-ink px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-clay" href="/work-with-tj">
            Get in touch
          </Link>
          <a className="focus-ring rounded-full border border-stone px-5 py-3 text-sm font-semibold text-ink transition hover:border-teal" href={sequenceUrl}>
            Explore Sequence
          </a>
        </div>
      </div>
    </section>
  );
}
