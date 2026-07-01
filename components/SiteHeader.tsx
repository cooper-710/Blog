import Link from "next/link";
import { SITE_NAV_ITEMS } from "@/lib/site-copy";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone/60 bg-ivory/90 backdrop-blur">
      <div className="editorial-container flex h-16 items-center justify-between gap-2 sm:gap-4">
        <Link href="/" className="focus-ring group flex items-baseline gap-3 rounded-full transition hover:text-clay">
          <span className="font-serif text-xl leading-none text-ink transition group-hover:text-clay sm:text-2xl">TJ Galenti</span>
          <span className="hidden text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-teal transition group-hover:text-clay sm:inline">
            Biomechanics
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="flex items-center gap-0.5 sm:gap-2">
          {SITE_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring group relative rounded-full px-1.5 py-2 text-xs font-medium text-charcoal transition hover:text-clay sm:px-3 sm:text-sm"
            >
              <span>{item.label}</span>
              <span className="absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-clay transition-transform duration-200 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
