"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getHeadingsFromBlocks } from "@/lib/article-headings";
import type { PreviewViewport } from "@/lib/preview-viewport";
import type { ArticleBlock } from "@/lib/types";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className={`h-5 w-5 shrink-0 text-charcoal/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M5 7.5L10 12.5L15 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M5 5L15 15M15 5L5 15" strokeLinecap="round" />
    </svg>
  );
}

export function ArticleMobileToc({
  blocks,
  viewport
}: {
  blocks: ArticleBlock[];
  viewport?: PreviewViewport;
}) {
  const headings = useMemo(() => getHeadingsFromBlocks(blocks), [blocks]);
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  const headingIds = headings.map((heading) => heading.id).join("|");

  useEffect(() => {
    if (!headings.length) return;

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-96px 0px -62% 0px", threshold: [0, 0.1, 0.35, 0.6, 1] }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headingIds, headings]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setPinned(false);
          setDismissed(false);
          setOpen(false);
        } else {
          setPinned(true);
        }
      },
      { rootMargin: "-72px 0px 0px 0px", threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (barRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!headings.length) return null;
  if (viewport === "desktop") return null;

  const activeHeading = headings.find((heading) => heading.id === activeId) ?? headings[0];
  const visibilityClass = viewport ? "" : "lg:hidden";

  return (
    <>
      <div ref={sentinelRef} aria-hidden className={`h-px ${visibilityClass}`} />

      {!dismissed && (
        <div ref={barRef} className={`sticky top-[4.5rem] z-30 mb-8 w-full max-w-full min-w-0 relative ${visibilityClass}`}>
          <div className="overflow-hidden rounded-lg border border-stone bg-ivory/95 shadow-[0_8px_30px_rgba(17,17,17,0.06)] backdrop-blur">
            <div className="flex min-w-0 items-stretch">
              <button
                type="button"
                aria-expanded={open}
                aria-controls="article-mobile-toc"
                onClick={() => setOpen((current) => !current)}
                className="focus-ring flex min-w-0 flex-1 items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">In this article</p>
                  <p className="mt-1 truncate font-serif text-[1.05rem] leading-snug text-ink">{activeHeading.text}</p>
                </div>
                <ChevronIcon open={open} />
              </button>

              {pinned && (
                <button
                  type="button"
                  aria-label="Hide table of contents"
                  onClick={() => {
                    setOpen(false);
                    setDismissed(true);
                  }}
                  className="focus-ring shrink-0 border-l border-stone px-3.5 text-charcoal/55 transition hover:bg-paper hover:text-ink"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
          </div>

          {open && (
            <nav
              ref={panelRef}
              id="article-mobile-toc"
              aria-label="Article table of contents"
              className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-40 max-w-full overflow-hidden rounded-lg border border-stone bg-paper shadow-[0_16px_48px_rgba(17,17,17,0.14)]"
            >
              <ol className="max-h-[min(52vh,360px)] overflow-y-auto py-2">
                {headings.map((heading) => {
                  const isActive = heading.id === activeId;
                  return (
                    <li key={heading.id}>
                      <a
                        href={`#${heading.id}`}
                        onClick={() => setOpen(false)}
                        className={`focus-ring block rounded-md px-4 py-2.5 text-sm leading-snug transition ${
                          heading.level === 3 ? "pl-8" : ""
                        } ${isActive ? "bg-ivory font-semibold text-ink" : "text-charcoal/72 hover:bg-ivory hover:text-ink"}`}
                      >
                        {heading.text}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}
        </div>
      )}
    </>
  );
}
