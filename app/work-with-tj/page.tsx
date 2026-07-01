import type { Metadata } from "next";
import { WorkInquiryForm } from "@/components/WorkInquiryForm";
import { SITE_CONTACT_LINKS, SERVICE_FOCUS_TAGS } from "@/lib/site-copy";

export const metadata: Metadata = {
  title: "Connect",
  description:
    "Contact TJ Galenti for baseball performance, biomechanics, motion capture, analytics, training, pitching, and hitting support."
};

const contactLinks = SITE_CONTACT_LINKS.map((link) => ({
  ...link,
  icon: link.label.toLowerCase()
}));

const focusAreas = [...SERVICE_FOCUS_TAGS];

function ContactIcon({ type }: { type: string }) {
  if (type === "instagram") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.3" cy="6.8" r="1.2" fill="currentColor" />
      </svg>
    );
  }

  if (type === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <rect x="3.5" y="3.5" width="17" height="17" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 10v7M8 7.4v.1M11.5 17v-7M11.5 13.1c0-1.9 1.1-3.1 2.8-3.1 1.8 0 2.7 1.2 2.7 3.4V17" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m5 8 7 5 7-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

export default function WorkWithTJPage() {
  return (
    <main className="bg-ivory pb-16 pt-5 sm:pb-20 sm:pt-8">
      <section className="editorial-container overflow-hidden rounded-[24px] border border-stone/80 bg-paper p-2 shadow-soft sm:rounded-[38px] sm:p-3">
        <div className="grid gap-3 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="min-w-0 rounded-[20px] border border-stone/70 bg-ivory/82 p-5 sm:rounded-[32px] sm:p-10 lg:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">Connect</p>
            <h1 className="mt-4 max-w-4xl break-words font-serif text-[clamp(2.35rem,11vw,3.75rem)] leading-[0.98] text-ink text-balance sm:mt-5 sm:text-8xl">
              Inquiries
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-charcoal/78 sm:mt-7 sm:text-xl sm:leading-8">
              For athletes, coaches, parents, teams, and organizations interested in baseball performance, biomechanics,
              motion capture, consulting, applied data, or player development.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
              {focusAreas.map((area) => (
                <span key={area} className="rounded-full border border-stone bg-paper px-3 py-1.5 text-xs font-semibold text-charcoal/78 sm:px-4 sm:py-2 sm:text-sm">
                  {area}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            {contactLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                className="focus-ring group flex min-w-0 items-center gap-3 rounded-[20px] border border-stone/70 bg-ivory p-4 transition duration-200 hover:-translate-y-0.5 hover:border-teal hover:bg-paper sm:gap-4 sm:rounded-[30px] sm:p-5"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-navy text-ivory transition group-hover:bg-clay sm:h-12 sm:w-12">
                  <ContactIcon type={item.icon} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-teal">{item.label}</span>
                  <span className="mt-1 block truncate text-lg font-semibold text-ink">{item.value}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-container mt-8">
        <WorkInquiryForm />
      </section>

    </main>
  );
}
