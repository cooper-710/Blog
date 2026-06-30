import Image from "next/image";
import type { ArticleBlock } from "@/lib/types";
import { addHeadingIdsToHtml } from "@/lib/article-headings";
import { embedUrl } from "@/lib/utils";

function blockSettings(block: ArticleBlock) {
  return block.settings ?? {};
}

function spacingClass(block: ArticleBlock) {
  const spacing = blockSettings(block).spacing;
  if (spacing === "tight") return "my-4";
  if (spacing === "airy") return "my-12";
  return "my-7";
}

function widthClass(block: ArticleBlock) {
  const width = blockSettings(block).width;
  if (width === "narrow") return "mx-auto max-w-[640px]";
  if (width === "wide") return "mx-auto max-w-[980px]";
  if (width === "full") return "max-w-none";
  return "mx-auto max-w-[760px]";
}

function alignmentClass(block: ArticleBlock) {
  return blockSettings(block).align === "center" ? "text-center" : "";
}

function backgroundClass(block: ArticleBlock) {
  const background = blockSettings(block).background;
  if (background === "dark") return "rounded-[30px] bg-navy p-6 text-ivory";
  if (background === "sand") return "rounded-[30px] bg-paper p-6";
  if (background === "outlined") return "rounded-[30px] border border-stone bg-ivory p-6";
  return "";
}

function renderNested(blocks: ArticleBlock[]) {
  return blocks.map((block) => <BlockRenderer key={block.id} block={block} nested />);
}

function BlockRenderer({ block, nested = false }: { block: ArticleBlock; nested?: boolean }) {
  switch (block.type) {
    case "heading": {
      const Heading = block.level === 3 ? "h3" : "h2";
      return (
        <Heading
          id={block.text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}
          className={
            block.level === 3
              ? "mt-8 scroll-mt-24 font-serif text-xl leading-tight text-ink"
              : "mt-10 scroll-mt-24 font-serif text-2xl leading-tight text-ink text-balance"
          }
        >
          {block.text}
        </Heading>
      );
    }
    case "paragraph":
      return <p className={nested ? "text-base leading-7" : "article-prose"}>{block.text}</p>;
    case "rich_text":
      return (
        <div
          className={nested ? "rich-text text-base leading-7" : "rich-text article-prose"}
          dangerouslySetInnerHTML={{ __html: addHeadingIdsToHtml(block.html) }}
        />
      );
    case "image":
      return (
        <figure className="my-10">
          <div className="relative aspect-[16/10] overflow-hidden border border-stone bg-paper">
            <Image src={block.url} alt={block.alt || ""} fill sizes="(min-width: 1024px) 760px, 100vw" className="object-cover" />
          </div>
          {(block.caption || block.alt) && (
            <figcaption className="mt-3 border-l-2 border-teal pl-3 text-sm leading-6 text-charcoal/70">
              {block.caption || block.alt}
            </figcaption>
          )}
        </figure>
      );
    case "image_pair":
      return (
        <div className="my-10 grid gap-4 md:grid-cols-2">
          {block.images.map((image) => (
            <figure key={image.url}>
              <div className="relative aspect-[4/3] overflow-hidden border border-stone bg-paper">
                <Image src={image.url} alt={image.alt || ""} fill sizes="(min-width: 1024px) 380px, 100vw" className="object-cover" />
              </div>
              {image.caption && <figcaption className="mt-2 text-sm text-charcoal/65">{image.caption}</figcaption>}
            </figure>
          ))}
        </div>
      );
    case "video_embed":
      return (
        <figure className="my-10">
          <div className="aspect-video overflow-hidden border border-stone bg-ink">
            <iframe
              src={embedUrl(block.url)}
              title={block.title || "Embedded video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
          {block.caption && <figcaption className="mt-3 text-sm text-charcoal/65">{block.caption}</figcaption>}
        </figure>
      );
    case "pull_quote":
      return (
        <aside className="my-12 border-y border-stone py-8">
          <blockquote className="font-serif text-3xl leading-tight text-navy text-balance">
            &ldquo;{block.quote}&rdquo;
          </blockquote>
          {block.attribution && <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-teal">{block.attribution}</p>}
        </aside>
      );
    case "key_takeaway":
      return (
        <aside className="my-8 border border-clay/40 bg-paper p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{block.title || "Key takeaway"}</p>
          <p className="mt-3 font-serif text-xl leading-8 text-ink">{block.body}</p>
        </aside>
      );
    case "data_callout":
      return (
        <aside className="my-10 bg-navy p-6 text-ivory">
          {block.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">{block.eyebrow}</p>}
          <h3 className="mt-2 font-serif text-3xl leading-tight">{block.title}</h3>
          <p className="mt-4 leading-7 text-ivory/82">{block.body}</p>
          {!!block.stats?.length && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {block.stats.map((stat) => (
                <div key={`${stat.label}-${stat.value}`} className="border border-ivory/18 p-4">
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ivory/62">{stat.label}</p>
                  {stat.context && <p className="mt-2 text-sm text-ivory/70">{stat.context}</p>}
                </div>
              ))}
            </div>
          )}
        </aside>
      );
    case "stat_grid":
      return (
        <div className="my-8 grid gap-3 sm:grid-cols-3">
          {block.stats.map((stat) => (
            <div key={`${stat.label}-${stat.value}`} className="border border-stone bg-paper p-5">
              <p className="font-serif text-3xl text-ink">{stat.value}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-teal">{stat.label}</p>
              {stat.context && <p className="mt-2 text-sm leading-6 text-charcoal/70">{stat.context}</p>}
            </div>
          ))}
        </div>
      );
    case "two_column":
      return (
        <div className="my-10 grid gap-8 border-y border-stone py-8 md:grid-cols-2">
          <div className="space-y-5">{renderNested(block.left)}</div>
          <div className="space-y-5">{renderNested(block.right)}</div>
        </div>
      );
    case "numbered_list":
      return (
        <ol className="article-prose list-decimal space-y-3 pl-6">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    case "bullet_list":
      return (
        <ul className="article-prose list-disc space-y-3 pl-6">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "biomech_note":
      return (
        <aside className="my-8 border-l-4 border-teal bg-paper/65 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">{block.title || "Biomech note"}</p>
          <p className="mt-3 leading-7 text-charcoal">{block.body}</p>
        </aside>
      );
    case "cta_box":
      return (
        <aside className="my-10 border border-stone bg-paper p-6">
          <h3 className="font-serif text-3xl text-ink">{block.title}</h3>
          <p className="mt-3 leading-7 text-charcoal/75">{block.body}</p>
          <a
            href={block.href}
            className="focus-ring mt-5 inline-flex rounded-sm bg-ink px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-clay"
          >
            {block.label}
          </a>
        </aside>
      );
    case "references":
      return (
        <section className="my-12 border-t border-stone pt-6">
          <h2 className="font-serif text-2xl text-ink">References</h2>
          <ol className="mt-4 space-y-3 text-sm leading-6 text-charcoal/75">
            {block.items.map((item) => (
              <li key={item.url}>
                <a className="focus-ring rounded-sm underline decoration-teal underline-offset-4" href={item.url} target="_blank" rel="noreferrer">
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </section>
      );
    default:
      return null;
  }
}

export function ArticleRenderer({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div>
      {blocks.map((block) => (
        <div key={block.id} className={`${spacingClass(block)} ${widthClass(block)} ${alignmentClass(block)} ${backgroundClass(block)}`}>
          <BlockRenderer block={block} />
        </div>
      ))}
    </div>
  );
}
