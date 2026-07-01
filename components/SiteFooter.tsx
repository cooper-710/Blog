"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SERVICE_TOPICS_LINE, SITE_CONTACT_LINKS, SITE_NAV_ITEMS } from "@/lib/site-copy";

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="border-t border-ink bg-ink text-ivory">
      <div className="editorial-container py-9 sm:py-10">
        <div className="grid gap-8 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:gap-14">
          <div>
            <Link href="/" className="focus-ring group inline-flex rounded-full">
              <span className="font-serif text-3xl leading-none transition group-hover:text-clay">TJ Galenti</span>
            </Link>
            <p className="mt-4 max-w-lg text-xs font-semibold uppercase tracking-[0.18em] text-teal">
              {SERVICE_TOPICS_LINE}
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Pages</p>
            <ul className="mt-4 grid gap-2">
              {SITE_NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="focus-ring inline-flex rounded-full py-1 text-sm font-semibold text-ivory/78 transition hover:text-clay"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Contact</p>
            <ul className="mt-4 grid gap-2">
              {SITE_CONTACT_LINKS.map((item) => {
                const isExternal = item.href.startsWith("http");

                return (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noreferrer" : undefined}
                      className="focus-ring inline-flex rounded-full py-1 text-sm font-semibold text-ivory/78 transition hover:text-clay"
                    >
                      {item.value}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-ivory/12 pt-5 text-center text-xs font-medium text-ivory/52">
          <p>&copy; {new Date().getFullYear()} TJ Galenti. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
