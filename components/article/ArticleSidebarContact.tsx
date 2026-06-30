import Link from "next/link";
import { SERVICE_TOPICS_LINE } from "@/lib/site-copy";

const sequenceUrl = process.env.NEXT_PUBLIC_SEQUENCE_URL || "https://www.instagram.com/sequencebiolab/";

export function ArticleSidebarContact() {
  return (
    <section className="rounded-[22px] border border-stone bg-paper p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Contact</p>
      <h2 className="mt-3 font-serif text-2xl leading-tight text-ink">Connect with me</h2>
      <p className="mt-2 text-xs font-medium leading-relaxed tracking-wide text-charcoal/60">
        {SERVICE_TOPICS_LINE}
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <Link
          className="focus-ring rounded-full bg-ink px-4 py-2.5 text-center text-sm font-semibold text-ivory transition hover:bg-clay"
          href="/work-with-tj"
        >
          Get in touch
        </Link>
        <a
          className="focus-ring rounded-full border border-stone px-4 py-2.5 text-center text-sm font-semibold text-ink transition hover:border-teal"
          href={sequenceUrl}
        >
          Explore Sequence
        </a>
      </div>
    </section>
  );
}
