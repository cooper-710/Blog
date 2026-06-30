import type { ArticleBlock } from "@/lib/types";
import { getHeadingsFromBlocks } from "@/lib/article-headings";

export function getHeadings(blocks: ArticleBlock[]) {
  return getHeadingsFromBlocks(blocks);
}

export function TableOfContents({ blocks }: { blocks: ArticleBlock[] }) {
  const headings = getHeadingsFromBlocks(blocks);
  if (!headings.length) return null;

  return (
    <nav aria-label="Article table of contents" className="sticky top-24 hidden border-l border-stone pl-5 text-sm lg:block">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-teal">In this article</p>
      <ol className="space-y-3">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? "pl-3" : undefined}>
            <a href={`#${heading.id}`} className="focus-ring rounded-sm text-charcoal/70 hover:text-clay">
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
