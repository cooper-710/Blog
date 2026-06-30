"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArticlePreviewCard } from "@/components/article/ArticlePreviewCard";
import type { Article } from "@/lib/types";

type RecentArticlesScrollRailProps = {
  articles: Article[];
};

function updateScrollState(container: HTMLDivElement | null) {
  if (!container) {
    return { canScrollLeft: false, canScrollRight: false, isScrollable: false };
  }

  const { scrollLeft, scrollWidth, clientWidth } = container;
  const isScrollable = scrollWidth - clientWidth > 8;

  return {
    canScrollLeft: isScrollable && scrollLeft > 8,
    canScrollRight: isScrollable && scrollLeft < scrollWidth - clientWidth - 8,
    isScrollable
  };
}

function RailArrow({
  direction,
  onClick,
  visible,
  variant = "overlay"
}: {
  direction: "left" | "right";
  onClick: () => void;
  visible: boolean;
  variant?: "overlay" | "inline";
}) {
  const label = direction === "left" ? "Show earlier articles" : "Show more articles";
  const positionClass =
    variant === "overlay"
      ? `absolute top-1/2 z-20 hidden -translate-y-1/2 sm:flex ${direction === "left" ? "left-2" : "right-2"}`
      : "relative flex";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`focus-ring ${positionClass} h-10 w-10 items-center justify-center rounded-full border border-stone bg-ivory/95 text-lg text-ink shadow-[0_8px_24px_rgba(17,17,17,0.08)] transition duration-200 hover:border-clay hover:text-clay ${
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <span aria-hidden>{direction === "left" ? "←" : "→"}</span>
    </button>
  );
}

export function RecentArticlesScrollRail({ articles }: RecentArticlesScrollRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const syncScrollState = useCallback(() => {
    const next = updateScrollState(railRef.current);
    setCanScrollLeft(next.canScrollLeft);
    setCanScrollRight(next.canScrollRight);
  }, []);

  useEffect(() => {
    syncScrollState();

    const rail = railRef.current;
    if (!rail) return;

    const observer = new ResizeObserver(syncScrollState);
    observer.observe(rail);
    rail.addEventListener("scroll", syncScrollState, { passive: true });
    window.addEventListener("resize", syncScrollState);

    return () => {
      observer.disconnect();
      rail.removeEventListener("scroll", syncScrollState);
      window.removeEventListener("resize", syncScrollState);
    };
  }, [articles.length, syncScrollState]);

  const scrollByCards = (direction: "left" | "right") => {
    const rail = railRef.current;
    if (!rail) return;

    const card = rail.querySelector<HTMLElement>(".recent-articles-rail-item");
    const gap = 28;
    const amount = (card?.offsetWidth ?? 320) + gap;

    rail.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth"
    });
  };

  return (
    <div className="relative mt-5 sm:mt-6">
      <div className="mb-3 flex justify-end gap-2 sm:hidden">
        <RailArrow direction="left" variant="inline" visible={canScrollLeft} onClick={() => scrollByCards("left")} />
        <RailArrow direction="right" variant="inline" visible={canScrollRight} onClick={() => scrollByCards("right")} />
      </div>

      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-10 bg-gradient-to-r from-ivory to-transparent transition-opacity duration-200 sm:block sm:w-14 ${
          canScrollLeft ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-12 bg-gradient-to-l from-ivory to-transparent transition-opacity duration-200 sm:block sm:w-16 ${
          canScrollRight ? "opacity-100" : "opacity-0"
        }`}
      />

      <RailArrow direction="left" visible={canScrollLeft} onClick={() => scrollByCards("left")} />
      <RailArrow direction="right" visible={canScrollRight} onClick={() => scrollByCards("right")} />

      <div
        ref={railRef}
        className="recent-articles-rail flex gap-6 overflow-x-auto scroll-smooth pb-2 pt-1 sm:gap-7"
        tabIndex={0}
        aria-label="Recent articles"
      >
        {articles.map((article) => (
          <div key={article.id} className="recent-articles-rail-item shrink-0 snap-start">
            <ArticlePreviewCard article={article} />
          </div>
        ))}
      </div>
    </div>
  );
}
