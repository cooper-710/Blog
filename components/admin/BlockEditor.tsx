"use client";

import type { ArticleBlock, StatItem } from "@/lib/types";

const blockTypes: ArticleBlock["type"][] = [
  "heading",
  "paragraph",
  "rich_text",
  "image",
  "image_pair",
  "video_embed",
  "pull_quote",
  "key_takeaway",
  "data_callout",
  "stat_grid",
  "two_column",
  "numbered_list",
  "bullet_list",
  "biomech_note",
  "cta_box",
  "references"
];

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `block-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createEmptyBlock(type: ArticleBlock["type"]): ArticleBlock {
  const id = newId();
  switch (type) {
    case "heading":
      return { id, type, level: 2, text: "New section" };
    case "paragraph":
      return { id, type, text: "Write the paragraph here." };
    case "rich_text":
      return { id, type, html: "<p>Write rich HTML here.</p>" };
    case "image":
      return { id, type, url: "", alt: "", caption: "" };
    case "image_pair":
      return {
        id,
        type,
        images: [
          { url: "", alt: "", caption: "" },
          { url: "", alt: "", caption: "" }
        ]
      };
    case "video_embed":
      return { id, type, url: "", title: "", caption: "" };
    case "pull_quote":
      return { id, type, quote: "Add a quote.", attribution: "" };
    case "key_takeaway":
      return { id, type, title: "Key takeaway", body: "Add the practical takeaway." };
    case "data_callout":
      return {
        id,
        type,
        eyebrow: "Data callout",
        title: "Metric context",
        body: "Explain what this signal means and how it changes the decision.",
        stats: [{ label: "Metric", value: "Value", context: "Context" }]
      };
    case "stat_grid":
      return { id, type, stats: [{ label: "Metric", value: "Value", context: "Context" }] };
    case "two_column":
      return {
        id,
        type,
        left: [{ id: newId(), type: "paragraph", text: "Left column copy." }],
        right: [{ id: newId(), type: "paragraph", text: "Right column copy." }]
      };
    case "numbered_list":
      return { id, type, items: ["First point", "Second point"] };
    case "bullet_list":
      return { id, type, items: ["First point", "Second point"] };
    case "biomech_note":
      return { id, type, title: "Biomech note", body: "Add expert commentary." };
    case "cta_box":
      return { id, type, title: "Connect", body: "Add CTA copy.", href: "/connect", label: "Start the conversation" };
    case "references":
      return { id, type, items: [{ label: "Source title", url: "https://example.com" }] };
  }
}

function TextInput({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-charcoal/65">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring mt-2 w-full border border-stone bg-ivory px-3 py-2 text-sm"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 4
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-charcoal/65">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring mt-2 w-full border border-stone bg-ivory px-3 py-2 text-sm leading-6"
      />
    </label>
  );
}

function lines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function statsToText(stats: StatItem[] = []) {
  return stats.map((stat) => [stat.label, stat.value, stat.context ?? ""].join(" | ")).join("\n");
}

function textToStats(value: string): StatItem[] {
  return lines(value).map((line) => {
    const [label = "", statValue = "", context = ""] = line.split("|").map((part) => part.trim());
    return { label, value: statValue, context };
  });
}

export function BlockEditor({
  blocks,
  onChange,
  onUploadImage
}: {
  blocks: ArticleBlock[];
  onChange: (blocks: ArticleBlock[]) => void;
  onUploadImage: (file: File) => Promise<string | null>;
}) {
  function updateBlock(index: number, nextBlock: ArticleBlock) {
    onChange(blocks.map((block, current) => (current === index ? nextBlock : block)));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const next = [...blocks];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function removeBlock(index: number) {
    onChange(blocks.filter((_, current) => current !== index));
  }

  async function uploadInto(index: number, setter: (url: string) => ArticleBlock) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const url = await onUploadImage(file);
      if (url) updateBlock(index, setter(url));
    };
    input.click();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 border border-stone bg-paper p-3">
        <span className="mr-2 text-sm font-semibold text-charcoal">Add block</span>
        {blockTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange([...blocks, createEmptyBlock(type)])}
            className="focus-ring rounded-sm border border-stone bg-ivory px-2 py-1 text-xs font-semibold text-charcoal hover:border-teal"
          >
            {type.replaceAll("_", " ")}
          </button>
        ))}
      </div>

      {blocks.map((block, index) => (
        <section key={block.id} className="border border-stone bg-paper p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-stone pb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">{block.type.replaceAll("_", " ")}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => moveBlock(index, -1)} className="focus-ring border border-stone px-2 py-1 text-xs">Up</button>
              <button type="button" onClick={() => moveBlock(index, 1)} className="focus-ring border border-stone px-2 py-1 text-xs">Down</button>
              <button type="button" onClick={() => removeBlock(index)} className="focus-ring border border-clay/50 px-2 py-1 text-xs text-clay">Delete</button>
            </div>
          </div>

          <div className="grid gap-4">
            {block.type === "heading" && (
              <>
                <TextInput label="Heading" value={block.text} onChange={(text) => updateBlock(index, { ...block, text })} />
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-charcoal/65">Level</span>
                  <select
                    value={block.level ?? 2}
                    onChange={(event) => updateBlock(index, { ...block, level: Number(event.target.value) as 2 | 3 })}
                    className="focus-ring mt-2 w-full border border-stone bg-ivory px-3 py-2 text-sm"
                  >
                    <option value={2}>H2</option>
                    <option value={3}>H3</option>
                  </select>
                </label>
              </>
            )}

            {block.type === "paragraph" && <TextArea label="Paragraph" value={block.text} onChange={(text) => updateBlock(index, { ...block, text })} rows={6} />}

            {block.type === "rich_text" && <TextArea label="HTML" value={block.html} onChange={(html) => updateBlock(index, { ...block, html })} rows={8} />}

            {block.type === "image" && (
              <>
                <TextInput label="Image URL" value={block.url} onChange={(url) => updateBlock(index, { ...block, url })} />
                <button type="button" onClick={() => uploadInto(index, (url) => ({ ...block, url }))} className="focus-ring w-fit rounded-sm bg-ink px-3 py-2 text-sm font-semibold text-ivory">Upload image</button>
                <TextInput label="Alt text" value={block.alt ?? ""} onChange={(alt) => updateBlock(index, { ...block, alt })} />
                <TextInput label="Caption" value={block.caption ?? ""} onChange={(caption) => updateBlock(index, { ...block, caption })} />
              </>
            )}

            {block.type === "image_pair" && (
              <>
                {[0, 1].map((imageIndex) => (
                  <div key={imageIndex} className="grid gap-3 border border-stone p-3">
                    <TextInput
                      label={`Image ${imageIndex + 1} URL`}
                      value={block.images[imageIndex].url}
                      onChange={(url) => {
                        const images = [...block.images] as typeof block.images;
                        images[imageIndex] = { ...images[imageIndex], url };
                        updateBlock(index, { ...block, images });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        uploadInto(index, (url) => {
                          const images = [...block.images] as typeof block.images;
                          images[imageIndex] = { ...images[imageIndex], url };
                          return { ...block, images };
                        })
                      }
                      className="focus-ring w-fit rounded-sm bg-ink px-3 py-2 text-sm font-semibold text-ivory"
                    >
                      Upload image {imageIndex + 1}
                    </button>
                    <TextInput
                      label="Alt text"
                      value={block.images[imageIndex].alt ?? ""}
                      onChange={(alt) => {
                        const images = [...block.images] as typeof block.images;
                        images[imageIndex] = { ...images[imageIndex], alt };
                        updateBlock(index, { ...block, images });
                      }}
                    />
                    <TextInput
                      label="Caption"
                      value={block.images[imageIndex].caption ?? ""}
                      onChange={(caption) => {
                        const images = [...block.images] as typeof block.images;
                        images[imageIndex] = { ...images[imageIndex], caption };
                        updateBlock(index, { ...block, images });
                      }}
                    />
                  </div>
                ))}
              </>
            )}

            {block.type === "video_embed" && (
              <>
                <TextInput label="Video URL" value={block.url} onChange={(url) => updateBlock(index, { ...block, url })} />
                <TextInput label="Title" value={block.title ?? ""} onChange={(title) => updateBlock(index, { ...block, title })} />
                <TextInput label="Caption" value={block.caption ?? ""} onChange={(caption) => updateBlock(index, { ...block, caption })} />
              </>
            )}

            {block.type === "pull_quote" && (
              <>
                <TextArea label="Quote" value={block.quote} onChange={(quote) => updateBlock(index, { ...block, quote })} />
                <TextInput label="Attribution" value={block.attribution ?? ""} onChange={(attribution) => updateBlock(index, { ...block, attribution })} />
              </>
            )}

            {(block.type === "key_takeaway" || block.type === "biomech_note") && (
              <>
                <TextInput label="Title" value={block.title ?? ""} onChange={(title) => updateBlock(index, { ...block, title } as ArticleBlock)} />
                <TextArea label="Body" value={block.body} onChange={(body) => updateBlock(index, { ...block, body } as ArticleBlock)} />
              </>
            )}

            {block.type === "data_callout" && (
              <>
                <TextInput label="Eyebrow" value={block.eyebrow ?? ""} onChange={(eyebrow) => updateBlock(index, { ...block, eyebrow })} />
                <TextInput label="Title" value={block.title} onChange={(title) => updateBlock(index, { ...block, title })} />
                <TextArea label="Body" value={block.body} onChange={(body) => updateBlock(index, { ...block, body })} />
                <TextArea label="Stats, one per line: label | value | context" value={statsToText(block.stats)} onChange={(value) => updateBlock(index, { ...block, stats: textToStats(value) })} />
              </>
            )}

            {block.type === "stat_grid" && (
              <TextArea label="Stats, one per line: label | value | context" value={statsToText(block.stats)} onChange={(value) => updateBlock(index, { ...block, stats: textToStats(value) })} />
            )}

            {block.type === "two_column" && (
              <>
                <TextArea
                  label="Left column paragraphs, one per line"
                  value={block.left.map((item) => ("text" in item ? item.text : "")).join("\n")}
                  onChange={(value) =>
                    updateBlock(index, {
                      ...block,
                      left: lines(value).map((text) => ({ id: newId(), type: "paragraph", text }))
                    })
                  }
                />
                <TextArea
                  label="Right column paragraphs, one per line"
                  value={block.right.map((item) => ("text" in item ? item.text : "")).join("\n")}
                  onChange={(value) =>
                    updateBlock(index, {
                      ...block,
                      right: lines(value).map((text) => ({ id: newId(), type: "paragraph", text }))
                    })
                  }
                />
              </>
            )}

            {(block.type === "numbered_list" || block.type === "bullet_list") && (
              <TextArea label="Items, one per line" value={block.items.join("\n")} onChange={(value) => updateBlock(index, { ...block, items: lines(value) } as ArticleBlock)} />
            )}

            {block.type === "cta_box" && (
              <>
                <TextInput label="Title" value={block.title} onChange={(title) => updateBlock(index, { ...block, title })} />
                <TextArea label="Body" value={block.body} onChange={(body) => updateBlock(index, { ...block, body })} />
                <TextInput label="Link URL" value={block.href} onChange={(href) => updateBlock(index, { ...block, href })} />
                <TextInput label="Button label" value={block.label} onChange={(label) => updateBlock(index, { ...block, label })} />
              </>
            )}

            {block.type === "references" && (
              <TextArea
                label="References, one per line: label | url"
                value={block.items.map((item) => `${item.label} | ${item.url}`).join("\n")}
                onChange={(value) =>
                  updateBlock(index, {
                    ...block,
                    items: lines(value).map((line) => {
                      const [label = "", url = ""] = line.split("|").map((part) => part.trim());
                      return { label, url };
                    })
                  })
                }
              />
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
