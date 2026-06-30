"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { buildArticlePayload, clearFeaturedExcept } from "@/lib/article-payload";
import type { PreviewViewport } from "@/lib/preview-viewport";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Article, ArticleStatus } from "@/lib/types";

function PreviewViewportToggle({
  viewport,
  onViewportChange
}: {
  viewport: PreviewViewport;
  onViewportChange: (viewport: PreviewViewport) => void;
}) {
  return (
    <div className="flex rounded-full border border-stone bg-ivory p-1">
      {(["desktop", "tablet", "mobile"] as PreviewViewport[]).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onViewportChange(mode)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${viewport === mode ? "bg-ink text-ivory" : "text-charcoal/65 hover:text-ink"}`}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}

export function ArticlePreviewBar({
  article,
  viewport,
  onViewportChange
}: {
  article: Article;
  viewport?: PreviewViewport;
  onViewportChange?: (viewport: PreviewViewport) => void;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(article.status);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function updateStatus(nextStatus: ArticleStatus) {
    setSaving(true);
    setMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: fetchError } = await supabase.from("articles").select("*").eq("id", article.id).single();
      if (fetchError) throw fetchError;

      const payload = buildArticlePayload(data as Article, nextStatus);
      if (payload.status === "published") {
        await clearFeaturedExcept(supabase, article.id);
      }
      const { error } = await supabase.from("articles").update(payload).eq("id", article.id);
      if (error) throw error;

      setStatus(nextStatus);
      setMessage(nextStatus === "published" ? "Article published." : "Article moved to draft.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update article.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border-b border-stone bg-paper py-3">
      <div className="editorial-container flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold capitalize text-charcoal">Admin preview: {status}</span>
          {message && <span className="text-teal">{message}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {viewport && onViewportChange && <PreviewViewportToggle viewport={viewport} onViewportChange={onViewportChange} />}
          {status === "published" && (
            <Link
              href={`/articles/${article.slug}`}
              className="focus-ring rounded-full border border-stone bg-ivory px-4 py-2 font-semibold text-charcoal hover:border-teal"
            >
              View live
            </Link>
          )}
          {status === "draft" ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => void updateStatus("published")}
              className="focus-ring rounded-full bg-ink px-4 py-2 font-semibold text-ivory transition hover:bg-clay disabled:opacity-60"
            >
              {saving ? "Publishing…" : "Publish"}
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={() => void updateStatus("draft")}
              className="focus-ring rounded-full border border-stone bg-ivory px-4 py-2 font-semibold text-charcoal hover:border-teal disabled:opacity-60"
            >
              {saving ? "Saving…" : "Unpublish"}
            </button>
          )}
          <Link href="/admin" className="focus-ring rounded-full border border-stone px-4 py-2 font-semibold text-charcoal hover:border-teal">
            Back to editor
          </Link>
        </div>
      </div>
    </div>
  );
}
