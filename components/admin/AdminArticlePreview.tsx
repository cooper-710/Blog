"use client";

import { useState } from "react";
import { ArticlePreviewBar } from "@/components/admin/ArticlePreviewBar";
import { ArticleHero } from "@/components/article/ArticleHero";
import { ArticleLayout } from "@/components/article/ArticleLayout";
import type { PreviewViewport } from "@/lib/preview-viewport";
import { previewFrameShellClass } from "@/lib/preview-viewport";
import type { Article } from "@/lib/types";

export function AdminArticlePreview({ article }: { article: Article }) {
  const [viewport, setViewport] = useState<PreviewViewport>("desktop");

  return (
    <main>
      <ArticlePreviewBar article={article} viewport={viewport} onViewportChange={setViewport} />
      <div
        data-viewport={viewport}
        className={`mx-auto transition-all duration-300 ${previewFrameShellClass(viewport, "page")}`}
      >
        <ArticleHero article={article} preview viewport={viewport} />
        <ArticleLayout blocks={article.content_blocks} viewport={viewport} />
      </div>
    </main>
  );
}
