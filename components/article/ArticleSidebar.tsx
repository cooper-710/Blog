import type { ArticleBlock } from "@/lib/types";
import { getHeadingsFromBlocks } from "@/lib/article-headings";
import type { PreviewViewport } from "@/lib/preview-viewport";
import { ArticleSidebarContact } from "@/components/article/ArticleSidebarContact";

function sidebarVisibilityClass(viewport?: PreviewViewport) {
  if (viewport === "desktop") return "block";
  if (viewport) return "hidden";
  return "hidden lg:block";
}

export function ArticleSidebar({ blocks, viewport }: { blocks: ArticleBlock[]; viewport?: PreviewViewport }) {
  const headings = getHeadingsFromBlocks(blocks);

  return (
    <aside className={`sticky top-24 ${sidebarVisibilityClass(viewport)}`}>
      <div className="space-y-8">
        {headings.length > 0 && (
          <nav aria-label="Article table of contents" className="rounded-[22px] border border-stone bg-paper p-5 text-sm">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-teal">In this article</p>
            <ol className="space-y-3 border-l border-stone pl-4">
              {headings.map((heading) => (
                <li key={heading.id} className={heading.level === 3 ? "pl-2" : undefined}>
                  <a href={`#${heading.id}`} className="focus-ring rounded-sm text-charcoal/70 transition hover:text-clay">
                    {heading.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <ArticleSidebarContact />
      </div>
    </aside>
  );
}
