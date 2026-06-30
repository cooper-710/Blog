import type { Metadata } from "next";
import { WorkInquiryForm } from "@/components/WorkInquiryForm";
import { SERVICE_FOCUS_TAGS } from "@/lib/site-copy";

export const metadata: Metadata = {
  title: "Work With TJ",
  description:
    "Contact TJ Galenti for baseball performance, biomechanics, mocap, analytics, training, pitching, and hitting support."
};

const contactEmail = "contact@sequencebiolab.com";

const contactLinks = [
  {
    label: "Email",
    value: contactEmail,
    href: `mailto:${contactEmail}`,
    icon: "email"
  },
  {
    label: "LinkedIn",
    value: "TJ Galenti",
    href: "https://www.linkedin.com/in/t-j-galenti/",
    icon: "linkedin"
  },
  {
    label: "Instagram",
    value: "@sequencebiolab",
    href: "https://www.instagram.com/sequencebiolab/",
    icon: "instagram"
  }
];

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
    <main className="bg-ivory pb-16 pt-8 sm:pb-20">
      <section className="editorial-container overflow-hidden rounded-[38px] border border-stone/80 bg-paper p-3 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[32px] border border-stone/70 bg-ivory/82 p-7 sm:p-10 lg:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">Work With TJ</p>
            <h1 className="mt-5 max-w-4xl font-serif text-6xl leading-[0.98] text-ink text-balance sm:text-8xl">
              Start the conversation.
            </h1>
            <p className="mt-7 max-w-2xl text-xl leading-8 text-charcoal/78">
              For athletes, coaches, parents, teams, and organizations looking for help with baseball performance,
              biomechanics, mocap, analytics, or training decisions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {focusAreas.map((area) => (
                <span key={area} className="rounded-full border border-stone bg-paper px-4 py-2 text-sm font-semibold text-charcoal/78">
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
                className="focus-ring group flex items-center gap-4 rounded-[30px] border border-stone/70 bg-ivory p-5 transition duration-200 hover:-translate-y-0.5 hover:border-teal hover:bg-paper"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-navy text-ivory transition group-hover:bg-clay">
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
