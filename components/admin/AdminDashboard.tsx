"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createEmptyBlock } from "@/components/admin/BlockEditor";
import { MediaResizeOverlay, type ResizeHandle } from "@/components/admin/MediaResizeOverlay";
import { buildArticlePayload, clearFeaturedExcept } from "@/lib/article-payload";
import { previewFrameShellClass, previewSubtitleClasses, previewTitleClasses, type PreviewViewport } from "@/lib/preview-viewport";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Article, ArticleBlock, ArticleCategory, ArticleStatus } from "@/lib/types";
import { categories, estimateReadTime, formatDate, slugify } from "@/lib/utils";

type AutoSaveState = "saved" | "waiting" | "saving" | "offline" | "error";
type InsertType =
  | "paragraph"
  | "heading"
  | "image"
  | "image_pair"
  | "pull_quote"
  | "key_takeaway"
  | "biomech_note"
  | "data_callout"
  | "two_column"
  | "cta_box"
  | "references"
  | "video_embed";

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `block-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function emptyArticle(): Omit<Article, "id" | "created_at" | "updated_at"> {
  return {
    title: "Untitled article",
    subtitle: "",
    slug: `untitled-article-${Date.now()}`,
    excerpt: "",
    category: "Biomechanics",
    tags: [],
    author_name: "TJ Galenti",
    hero_image_url: "",
    hero_image_alt: "",
    status: "draft",
    featured: false,
    read_time_minutes: 1,
    seo_title: "",
    seo_description: "",
    content_blocks: [createEmptyBlock("paragraph")],
    published_at: null
  };
}

function splitSentences(value: string) {
  return value.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [];
}

function blockLabel(block: ArticleBlock) {
  switch (block.type) {
    case "heading":
      return block.text || "Section heading";
    case "paragraph":
      return block.text.slice(0, 64) || "Text section";
    case "image":
      return block.caption || block.alt || "Image";
    case "image_pair":
      return "Image pair";
    case "pull_quote":
      return block.quote.slice(0, 64) || "Pull quote";
    case "key_takeaway":
      return block.title || "Key takeaway";
    case "biomech_note":
      return block.title || "Biomech note";
    case "data_callout":
      return block.title || "Stat callout";
    case "two_column":
      return "Two-column section";
    case "references":
      return "References";
    case "video_embed":
      return block.title || "Video embed";
    case "cta_box":
      return block.title || "CTA box";
    case "stat_grid":
      return "Stat grid";
    case "numbered_list":
      return "Numbered list";
    case "bullet_list":
      return "Bullet list";
    case "rich_text":
      return "Rich text";
  }
}

function makeBlock(type: InsertType): ArticleBlock {
  switch (type) {
    case "paragraph":
      return { id: newId(), type, text: "Start writing here." };
    case "heading":
      return { id: newId(), type, level: 2, text: "New section" };
    case "image":
      return { id: newId(), type, url: "", alt: "", caption: "Add a caption or note." };
    case "data_callout":
      return {
        id: newId(),
        type,
        eyebrow: "Stat callout",
        title: "Metric worth watching",
        body: "Add the number, then explain what it changes about the player or training decision."
      };
    default:
      return createEmptyBlock(type);
  }
}

function structureDenseArticle(raw: string): Pick<Article, "title" | "subtitle" | "excerpt" | "content_blocks"> {
  const cleanLines = raw.replace(/\r/g, "").split("\n").map((line) => line.trim());
  const paragraphs = raw.replace(/\r/g, "").split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  const titleLine = cleanLines.find(Boolean) || "Untitled article";
  const title = titleLine.replace(/^#+\s*/, "").slice(0, 140);
  const bodyChunks = paragraphs.filter((chunk) => chunk !== titleLine);
  const maybeSubtitle = bodyChunks[0] && bodyChunks[0].length < 190 && !/[.!?]$/.test(bodyChunks[0]) ? bodyChunks.shift() ?? "" : "";
  const blocks: ArticleBlock[] = [];
  let pullQuoteAdded = false;
  let takeawayAdded = false;

  bodyChunks.forEach((chunk) => {
    const withoutHashes = chunk.replace(/^#+\s*/, "");
    const isHeading = chunk.startsWith("#") || (withoutHashes.length <= 82 && !/[.!?]$/.test(withoutHashes) && !withoutHashes.includes("http"));

    if (isHeading) {
      blocks.push({ id: newId(), type: "heading", level: 2, text: withoutHashes });
      return;
    }

    const sentences = splitSentences(chunk);
    if (chunk.length > 650 && sentences.length > 4) {
      const midpoint = Math.ceil(sentences.length / 2);
      blocks.push({ id: newId(), type: "paragraph", text: sentences.slice(0, midpoint).join(" ") });
      blocks.push({ id: newId(), type: "paragraph", text: sentences.slice(midpoint).join(" ") });
    } else {
      blocks.push({ id: newId(), type: "paragraph", text: chunk });
    }

    const quoteCandidate = sentences.find((sentence) => sentence.length > 95 && sentence.length < 210);
    if (!pullQuoteAdded && quoteCandidate && blocks.length > 3) {
      blocks.push({ id: newId(), type: "pull_quote", quote: quoteCandidate.replace(/^["']|["']$/g, ""), attribution: "" });
      pullQuoteAdded = true;
    }

    if (!takeawayAdded && /because|therefore|this means|the goal|the key/i.test(chunk) && chunk.length < 420) {
      blocks.push({ id: newId(), type: "key_takeaway", title: "Key takeaway", body: chunk });
      takeawayAdded = true;
    }
  });

  const referenceLines = cleanLines.filter((line) => /(https?:\/\/|doi:|journal|study)/i.test(line));
  if (referenceLines.length) {
    blocks.push({
      id: newId(),
      type: "references",
      items: referenceLines.map((line) => {
        const url = line.match(/https?:\/\/\S+/)?.[0] ?? "";
        return { label: line.replace(url, "").trim() || url || "Reference", url: url || "#" };
      })
    });
  }

  return {
    title,
    subtitle: maybeSubtitle,
    excerpt: bodyChunks.find((chunk) => chunk.length > 60)?.slice(0, 220) ?? "",
    content_blocks: blocks.length ? blocks : [{ id: newId(), type: "paragraph", text: raw }]
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraphsToHtml(value: string) {
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${escapeHtml(part.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function blocksToDocumentHtml(blocks: ArticleBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "heading":
          return block.level === 3 ? `<h3>${escapeHtml(block.text)}</h3>` : `<h2>${escapeHtml(block.text)}</h2>`;
        case "paragraph":
          return paragraphsToHtml(block.text);
        case "rich_text":
          return block.html;
        case "pull_quote":
          return `<blockquote>${escapeHtml(block.quote)}${block.attribution ? `<cite>${escapeHtml(block.attribution)}</cite>` : ""}</blockquote>`;
        case "key_takeaway":
          return `<aside class="key-takeaway"><strong>${escapeHtml(block.title || "Key takeaway")}</strong><p>${escapeHtml(block.body)}</p></aside>`;
        case "biomech_note":
          return `<aside class="biomech-note"><strong>${escapeHtml(block.title || "Biomech note")}</strong><p>${escapeHtml(block.body)}</p></aside>`;
        case "image":
          return `<figure><img src="${escapeHtml(block.url)}" alt="${escapeHtml(block.alt || "")}">${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ""}</figure>`;
        case "image_pair":
          return `<div class="image-pair">${block.images
            .map((image) => `<figure><img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt || "")}">${image.caption ? `<figcaption>${escapeHtml(image.caption)}</figcaption>` : ""}</figure>`)
            .join("")}</div>`;
        case "data_callout":
          return `<aside class="stat-callout"><strong>${escapeHtml(block.title)}</strong><p>${escapeHtml(block.body)}</p></aside>`;
        case "numbered_list":
          return `<ol>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`;
        case "bullet_list":
          return `<ul>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
        case "references":
          return `<h2>References</h2><ol>${block.items.map((item) => `<li><a href="${escapeHtml(item.url)}">${escapeHtml(item.label)}</a></li>`).join("")}</ol>`;
        case "cta_box":
          return `<aside class="cta-box"><h3>${escapeHtml(block.title)}</h3><p>${escapeHtml(block.body)}</p><p><a href="${escapeHtml(block.href)}">${escapeHtml(block.label)}</a></p></aside>`;
        case "two_column":
          return `<div class="two-column"><div>${blocksToDocumentHtml(block.left)}</div><div>${blocksToDocumentHtml(block.right)}</div></div>`;
        case "video_embed":
          return `<p><a href="${escapeHtml(block.url)}">${escapeHtml(block.title || block.url)}</a></p>`;
        case "stat_grid":
          return `<div class="stat-grid">${block.stats.map((stat) => `<p><strong>${escapeHtml(stat.value)}</strong> ${escapeHtml(stat.label)} ${escapeHtml(stat.context || "")}</p>`).join("")}</div>`;
      }
    })
    .join("");
}

function documentHtmlToBlocks(html: string): ArticleBlock[] {
  return [{ id: newId(), type: "rich_text", html: html.trim() || "<p></p>" }];
}

const fontSizeOptions = [14, 16, 18, 20, 22, 24, 28, 32, 36, 44, 52, 60, 72];

type ImageLayout = "left" | "center" | "right" | "full";

function findMediaFigure(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return null;
  const figure = target.closest("figure");
  if (!figure) return null;
  if (!figure.querySelector("img, video")) return null;
  return figure;
}

function getFigureLayout(figure: HTMLElement): ImageLayout {
  if (figure.classList.contains("doc-image-left")) return "left";
  if (figure.classList.contains("doc-image-center")) return "center";
  if (figure.classList.contains("doc-image-full")) return "full";
  return "right";
}

function applyFigureLayout(figure: HTMLElement, layout: ImageLayout) {
  figure.classList.add("doc-image");
  figure.classList.remove("doc-image-left", "doc-image-center", "doc-image-right", "doc-image-full");
  figure.classList.add(`doc-image-${layout}`);
}

function normalizeMediaFigure(figure: HTMLElement) {
  figure.setAttribute("draggable", "false");
  figure.setAttribute("contenteditable", "false");
  const img = figure.querySelector("img");
  if (img) {
    img.crossOrigin = "anonymous";
    if (!figure.classList.contains("doc-image")) {
      figure.classList.add("doc-image", "doc-image-right");
    }
  }
  if (figure.querySelector("video") && !figure.classList.contains("doc-video")) {
    figure.classList.add("doc-video");
  }
}

function getFigureMedia(figure: HTMLElement) {
  return figure.querySelector("img, video") as HTMLImageElement | HTMLVideoElement | null;
}

function getFigureMetrics(figure: HTMLElement) {
  const rect = figure.getBoundingClientRect();
  const media = getFigureMedia(figure);
  let aspectRatio = rect.width / Math.max(rect.height, 1);

  if (media instanceof HTMLImageElement && media.naturalWidth > 0) {
    aspectRatio = media.naturalWidth / media.naturalHeight;
  } else if (media instanceof HTMLVideoElement && media.videoWidth > 0) {
    aspectRatio = media.videoWidth / media.videoHeight;
  }

  return {
    width: figure.offsetWidth || rect.width,
    height: figure.offsetHeight || rect.height,
    aspectRatio
  };
}

function applyFigureSize(figure: HTMLElement, width: number, height: number) {
  figure.classList.add("doc-media-custom");
  figure.style.width = `${Math.round(width)}px`;
  figure.style.height = `${Math.round(height)}px`;
  const media = getFigureMedia(figure);
  if (!media) return;
  media.style.width = "100%";
  media.style.height = "100%";
  media.style.maxWidth = "none";
  media.style.objectFit = "cover";
  media.style.aspectRatio = "auto";
}

function figureCopyHtml(figure: HTMLElement) {
  return figure.outerHTML.replace(/\s*doc-media-selected/g, "").trim();
}

function rangeTouchesFigure(range: Range, figure: HTMLElement) {
  return figure.contains(range.commonAncestorContainer);
}

function caretContextFromRange(range: Range, editor: HTMLElement) {
  const node = range.startContainer;
  const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  const textBlock = element?.closest("p, h2, h3, blockquote, li") ?? null;
  const block = element?.closest("p, h2, h3, blockquote, li, figure, aside, ol, ul") ?? null;

  return {
    textBlock: textBlock && editor.contains(textBlock) ? textBlock : null,
    block: block && editor.contains(block) ? block : null
  };
}

function ensureSpacingAfterFigure(figure: HTMLElement) {
  const next = figure.nextSibling;
  if (!next) {
    figure.insertAdjacentHTML("afterend", "&nbsp;");
    return;
  }
  if (next.nodeType === Node.TEXT_NODE && !next.textContent?.trim()) return;
  if (next.nodeType === Node.ELEMENT_NODE && (next as Element).tagName === "BR") return;
}

function ensureBlockAfterFigure(figure: HTMLElement) {
  const next = figure.nextElementSibling;
  if (!next || (next.tagName !== "P" && next.tagName !== "FIGURE")) {
    figure.insertAdjacentHTML("afterend", "<p><br></p>");
  }
}

async function imageBlobFromElement(img: HTMLImageElement) {
  try {
    const response = await fetch(img.src);
    if (response.ok) {
      const blob = await response.blob();
      if (blob.type.startsWith("image/")) return blob;
    }
  } catch {
    // Fall back to canvas when fetch is blocked.
  }

  if (!img.complete || !img.naturalWidth) {
    await new Promise<void>((resolve, reject) => {
      img.addEventListener("load", () => resolve(), { once: true });
      img.addEventListener("error", () => reject(new Error("Image failed to load")), { once: true });
    });
  }

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(img, 0, 0);
  return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
}

function clipboardImageFile(event: React.ClipboardEvent<HTMLDivElement>) {
  const fileFromList = Array.from(event.clipboardData.files).find((file) => file.type.startsWith("image/"));
  if (fileFromList) return fileFromList;
  const item = Array.from(event.clipboardData.items).find((entry) => entry.type.startsWith("image/"));
  return item?.getAsFile() ?? null;
}

function EditableText({
  className,
  value,
  placeholder,
  onChange,
  multiline = false
}: {
  className: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      className={`${className} min-h-[1.5em] rounded-[12px] outline-none transition focus:bg-ivory/70 focus:ring-2 focus:ring-teal/40 empty:before:text-charcoal/35 empty:before:content-[attr(data-placeholder)]`}
      onBlur={(event) => onChange(multiline ? event.currentTarget.innerText : event.currentTarget.innerText.replace(/\n/g, " "))}
    >
      {value}
    </div>
  );
}

export function AdminDashboard({ initialArticles, email }: { initialArticles: Article[]; email: string }) {
  const [articles, setArticles] = useState(initialArticles);
  const [selectedId, setSelectedId] = useState<string | null>(initialArticles[0]?.id ?? null);
  const [draft, setDraft] = useState<Article | null>(initialArticles[0] ?? null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | "hero">("hero");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>("saved");
  const [autoSaveError, setAutoSaveError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewViewport>("desktop");
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [showImprove, setShowImprove] = useState(false);
  const autoSaveTimerRef = useRef<number | null>(null);
  const latestDraftRef = useRef<Article | null>(initialArticles[0] ?? null);
  const insertMediaRef = useRef<(url: string, isVideo: boolean) => void>(() => {});
  const [mediaItems, setMediaItems] = useState<string[]>(initialArticles.flatMap((article) => [
    article.hero_image_url,
    ...article.content_blocks.flatMap((block) => {
      if (block.type === "image") return [block.url];
      if (block.type === "image_pair") return block.images.map((image) => image.url);
      return [];
    })
  ]).filter(Boolean) as string[]);

  const selectedArticle = useMemo(() => articles.find((article) => article.id === selectedId) ?? null, [articles, selectedId]);
  const publishedArticles = useMemo(
    () => articles.filter((article) => article.status === "published").sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [articles]
  );
  const draftArticles = useMemo(
    () => articles.filter((article) => article.status === "draft").sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [articles]
  );

  useEffect(() => {
    latestDraftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) window.clearTimeout(autoSaveTimerRef.current);
    };
  }, []);

  const layoutSuggestions = (() => {
    if (!draft) return [];
    const suggestions: { title: string; body: string; apply: () => void }[] = [];
    const longParagraphIndex = draft.content_blocks.findIndex((block) => block.type === "paragraph" && block.text.length > 520);
    if (longParagraphIndex >= 0) {
      suggestions.push({
        title: "Break up a dense paragraph",
        body: "Split the longest paragraph into two cleaner reading beats.",
        apply: () => splitParagraph(longParagraphIndex)
      });
    }
    const pullQuoteIndex = draft.content_blocks.findIndex((block) => block.type === "paragraph" && block.text.length > 120 && block.text.length < 300);
    if (pullQuoteIndex >= 0 && !draft.content_blocks.some((block) => block.type === "pull_quote")) {
      suggestions.push({
        title: "Create a pull quote",
        body: "Use one strong paragraph as an editorial pause.",
        apply: () => transformBlock(pullQuoteIndex, "pull quote")
      });
    }
    const imageBreakIndex = draft.content_blocks.findIndex((block, index) => index > 2 && block.type === "heading");
    if (imageBreakIndex >= 0 && !draft.content_blocks.some((block) => block.type === "image")) {
      suggestions.push({
        title: "Add an image break",
        body: "Place a visual after the first major section to keep the piece from feeling text-heavy.",
        apply: () => insertBlock(imageBreakIndex + 1, "image")
      });
    }
    return suggestions;
  })();

  async function persistArticle(article: Article, status?: ArticleStatus, options: { syncDraft?: boolean; announce?: boolean } = {}) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setAutoSaveState("offline");
      setAutoSaveError("Offline. Changes are still on this page, but they have not reached the database yet.");
      return false;
    }

    const supabase = createSupabaseBrowserClient();
    const payload = buildArticlePayload(article, status);
    setAutoSaveState("saving");
    setAutoSaveError(null);

    try {
      if (payload.status === "published") {
        await clearFeaturedExcept(supabase, article.id);
      }
      const { error } = await supabase.from("articles").update(payload).eq("id", article.id);
      if (error) throw error;
      const savedArticle: Article = {
        ...article,
        ...payload,
        hero_image_url: payload.hero_image_url ?? "",
        updated_at: new Date().toISOString()
      };
      setArticles((current) =>
        current.map((item) => {
          if (item.id === article.id) return savedArticle;
          if (payload.status === "published") return { ...item, featured: false };
          return item;
        })
      );
      if (options.syncDraft) {
        setDraft(savedArticle);
        latestDraftRef.current = savedArticle;
      }
      setAutoSaveState("saved");
      setAutoSaveError(null);
      if (options.announce) setMessage(status === "published" ? "Article published." : null);
      return true;
    } catch (error) {
      setAutoSaveState(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "error");
      setAutoSaveError(error instanceof Error ? error.message : "Could not save article.");
      return false;
    }
  }

  function scheduleAutoSave(next: Article) {
    if (autoSaveTimerRef.current) window.clearTimeout(autoSaveTimerRef.current);
    setAutoSaveState("waiting");
    setAutoSaveError(null);
    autoSaveTimerRef.current = window.setTimeout(() => {
      autoSaveTimerRef.current = null;
      const current = latestDraftRef.current;
      if (current?.id === next.id) void persistArticle(current);
    }, 900);
  }

  function updateDraft(next: Article) {
    setDraft(next);
    latestDraftRef.current = next;
    setArticles((current) => current.map((article) => (article.id === next.id ? { ...article, ...next } : article)));
    scheduleAutoSave(next);
  }

  function selectArticle(article: Article) {
    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    setSelectedId(article.id);
    setDraft(article);
    latestDraftRef.current = article;
    setSelectedBlockId("hero");
    setMessage(null);
    setAutoSaveState("saved");
    setAutoSaveError(null);
  }

  async function refreshArticles(nextSelectedId?: string) {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from("articles").select("*").order("updated_at", { ascending: false });
    if (error) throw error;
    const next = (data ?? []) as Article[];
    setArticles(next);
    const target = nextSelectedId ? next.find((article) => article.id === nextSelectedId) : next.find((article) => article.id === selectedId);
    if (target) {
      setSelectedId(target.id);
      setDraft(target);
    } else {
      setSelectedId(next[0]?.id ?? null);
      setDraft(next[0] ?? null);
    }
  }

  async function createArticle() {
    const supabase = createSupabaseBrowserClient();
    setSaving(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.from("articles").insert(emptyArticle()).select("*").single();
      if (error) throw error;
      await refreshArticles((data as Article).id);
      setSelectedBlockId("hero");
      setMessage("Draft created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create article.");
    } finally {
      setSaving(false);
    }
  }

  async function saveArticle(status?: ArticleStatus) {
    if (!draft) return;
    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    setSaving(true);
    setMessage(null);
    try {
      await persistArticle(draft, status, { syncDraft: Boolean(status), announce: true });
    } finally {
      setSaving(false);
    }
  }

  async function deleteArticle(articleId: string) {
    if (!window.confirm("Delete this article? This cannot be undone.")) return;
    const supabase = createSupabaseBrowserClient();
    setSaving(true);
    try {
      const { error } = await supabase.from("articles").delete().eq("id", articleId);
      if (error) throw error;
      await refreshArticles();
      setMessage("Article deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete article.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadMedia(file: File, kind: "image" | "video" = "image") {
    if (kind === "image" && !file.type.startsWith("image/")) {
      setMessage("Only image files can be uploaded.");
      return null;
    }
    if (kind === "video" && !file.type.startsWith("video/")) {
      setMessage("Only video files can be uploaded.");
      return null;
    }

    const supabase = createSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    const path = `${userData.user?.id ?? "admin"}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from("article-media").upload(path, file, {
      cacheControl: "31536000",
      upsert: false
    });

    if (error) {
      setMessage(error.message);
      return null;
    }

    const { data } = supabase.storage.from("article-media").getPublicUrl(path);
    setMediaItems((items) => [data.publicUrl, ...items.filter((item) => item !== data.publicUrl)]);
    setMessage(kind === "video" ? "Video uploaded." : "Image uploaded.");
    return data.publicUrl;
  }

  async function uploadImage(file: File) {
    return uploadMedia(file, "image");
  }

  async function uploadVideo(file: File) {
    return uploadMedia(file, "video");
  }

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.reload();
  }

  function updateBlock(index: number, nextBlock: ArticleBlock) {
    if (!draft) return;
    const content_blocks = draft.content_blocks.map((block, current) => (current === index ? nextBlock : block));
    updateDraft({ ...draft, content_blocks });
  }

  function insertBlock(index: number, type: InsertType, imageUrl?: string) {
    if (!draft) return;
    const block = makeBlock(type);
    const nextBlock = imageUrl && block.type === "image" ? { ...block, url: imageUrl } : block;
    const next = [...draft.content_blocks];
    next.splice(index, 0, nextBlock);
    updateDraft({ ...draft, content_blocks: next });
    setSelectedBlockId(nextBlock.id);
  }

  function splitParagraph(index: number) {
    if (!draft) return;
    const block = draft.content_blocks[index];
    if (block?.type !== "paragraph") return;
    const sentences = splitSentences(block.text);
    if (sentences.length < 2) return;
    const midpoint = Math.ceil(sentences.length / 2);
    const next = [...draft.content_blocks];
    next.splice(index, 1, { ...block, text: sentences.slice(0, midpoint).join(" ") }, { id: newId(), type: "paragraph", text: sentences.slice(midpoint).join(" ") });
    updateDraft({ ...draft, content_blocks: next });
  }

  function transformBlock(index: number, style: string) {
    if (!draft) return;
    const block = draft.content_blocks[index];
    if (!block) return;
    const text =
      block.type === "paragraph" ? block.text :
      block.type === "heading" ? block.text :
      block.type === "pull_quote" ? block.quote :
      block.type === "key_takeaway" || block.type === "biomech_note" ? block.body :
      block.type === "data_callout" ? block.body :
      block.type === "cta_box" ? block.body :
      blockLabel(block);

    if (style === "heading") updateBlock(index, { id: block.id, type: "heading", level: 2, text });
    if (style === "subheading") updateBlock(index, { id: block.id, type: "heading", level: 3, text });
    if (style === "paragraph" || style === "lead paragraph") updateBlock(index, { id: block.id, type: "paragraph", text });
    if (style === "pull quote") updateBlock(index, { id: block.id, type: "pull_quote", quote: text, attribution: "" });
    if (style === "key takeaway") updateBlock(index, { id: block.id, type: "key_takeaway", title: "Key takeaway", body: text });
    if (style === "note") updateBlock(index, { id: block.id, type: "biomech_note", title: "Biomech note", body: text });
  }

  function applyStructure() {
    if (!draft || !importText.trim()) return;
    const structured = structureDenseArticle(importText);
    updateDraft({
      ...draft,
      title: structured.title,
      subtitle: structured.subtitle,
      excerpt: structured.excerpt,
      slug: draft.slug.startsWith("untitled-article") ? slugify(structured.title) : draft.slug,
      content_blocks: structured.content_blocks
    });
    setSelectedBlockId("hero");
    setShowImport(false);
    setImportText("");
    setMessage("Article structured into an editable draft.");
  }

  function renderArticleCard(article: Article) {
    return (
      <article
        key={article.id}
        className={`rounded-[20px] border p-3 transition ${article.id === selectedArticle?.id ? "border-teal bg-ivory shadow-[0_12px_32px_rgba(17,17,17,0.06)]" : "border-stone/70 bg-ivory/55 hover:border-teal/50"}`}
      >
        <button type="button" onClick={() => selectArticle(article)} className="focus-ring block w-full rounded-[14px] text-left">
          <h2 className="line-clamp-2 font-serif text-xl leading-tight text-ink">{article.title}</h2>
          <p className="mt-2 text-xs text-charcoal/58">{formatDate(article.updated_at)}</p>
        </button>
        <div className="mt-3 flex items-center justify-between gap-2">
          <Link href={`/admin/articles/${article.id}/preview`} className="focus-ring rounded-full border border-stone px-3 py-1.5 text-xs font-semibold text-charcoal/70 hover:border-teal">
            Preview
          </Link>
          <button type="button" onClick={() => deleteArticle(article.id)} className="focus-ring rounded-full px-2 py-1 text-xs font-semibold text-clay/75 hover:bg-clay/10">
            Delete
          </button>
        </div>
      </article>
    );
  }

  const autoSaveLabel =
    autoSaveState === "saved" ? "Saved" :
    autoSaveState === "offline" ? "Offline - not saved" :
    autoSaveState === "error" ? "Save failed" :
    "Saving...";

  const autoSaveClass =
    autoSaveState === "saved" ? "border-teal/35 bg-teal/10 text-teal" :
    autoSaveState === "offline" || autoSaveState === "error" ? "border-clay/35 bg-clay/10 text-clay" :
    "border-stone bg-paper text-charcoal/65";

  if (!draft) {
    return (
      <div className="min-h-screen bg-ivory">
        <div className="editorial-container py-12">
          <div className="rounded-[34px] border border-stone bg-paper p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Publishing dashboard</p>
            <h1 className="mt-3 font-serif text-5xl text-ink">Create an article</h1>
            <p className="mt-3 max-w-xl text-lg leading-8 text-charcoal/70">
              Start blank, or paste a full draft and let the editor structure it.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={createArticle} className="focus-ring rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory">
                New blank article
              </button>
              <button
                type="button"
                onClick={() => {
                  void createArticle();
                  setShowImport(true);
                }}
                className="focus-ring rounded-full border border-teal bg-ivory px-6 py-3 text-sm font-semibold text-ink"
              >
                Paste article
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden bg-ivory text-charcoal">
      <header className="overflow-x-hidden border-b border-stone bg-ivory/95">
        <div className="flex min-h-[72px] min-w-0 flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-teal">{draft.status} / {draft.category}</p>
            <h1 className="truncate font-serif text-2xl leading-tight text-ink">{draft.title || "Untitled article"}</h1>
          </div>

          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
            {message && <span className="hidden max-w-[280px] truncate text-sm text-charcoal/65 lg:inline">{message}</span>}
            <span title={autoSaveError ?? undefined} className={`rounded-full border px-3 py-2 text-xs font-semibold ${autoSaveClass}`}>
              {autoSaveLabel}
            </span>
            <div className="flex rounded-full border border-stone bg-paper p-1">
              {(["desktop", "tablet", "mobile"] as PreviewViewport[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPreviewMode(mode)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${previewMode === mode ? "bg-ink text-ivory" : "text-charcoal/65 hover:text-ink"}`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <Link href={`/admin/articles/${draft.id}/preview`} className="focus-ring rounded-full border border-stone bg-paper px-4 py-2 text-sm font-semibold text-charcoal hover:border-teal">
              Preview
            </Link>
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveArticle("published")}
              className="focus-ring rounded-full bg-ink px-5 py-2 text-sm font-semibold text-ivory transition hover:bg-clay disabled:opacity-60"
            >
              Publish
            </button>
          </div>
        </div>
      </header>

      <div className="grid min-w-0 grid-cols-1 overflow-x-hidden xl:h-[calc(100vh-164px)] xl:grid-cols-[280px_minmax(0,1fr)_340px]">
        <aside className="min-w-0 overflow-x-hidden border-r border-stone bg-paper/78 xl:h-full xl:overflow-y-auto">
          <div className="space-y-5 p-4 pb-12">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal">Create</p>
              <div className="mt-3 grid gap-2">
                <button type="button" onClick={createArticle} disabled={saving} className="focus-ring rounded-full bg-ink px-4 py-3 text-sm font-semibold text-ivory disabled:opacity-60">
                  New Article
                </button>
                <button type="button" onClick={() => setShowImport(true)} className="focus-ring rounded-full border border-teal/60 bg-ivory px-4 py-3 text-sm font-semibold text-ink">
                  Paste Article
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal">Articles</p>
                <button type="button" onClick={signOut} title={`Signed in as ${email}`} className="focus-ring rounded-full border border-stone px-3 py-1.5 text-xs font-semibold text-charcoal/65 hover:border-teal">
                  Sign out
                </button>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-charcoal/50">Published</p>
                {publishedArticles.length ? (
                  publishedArticles.map((article) => renderArticleCard(article))
                ) : (
                  <p className="rounded-[18px] border border-stone bg-ivory/55 px-3 py-4 text-sm text-charcoal/55">No published articles yet.</p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-charcoal/50">Drafts</p>
                {draftArticles.length ? (
                  draftArticles.map((article) => renderArticleCard(article))
                ) : (
                  <p className="rounded-[18px] border border-stone bg-ivory/55 px-3 py-4 text-sm text-charcoal/55">No drafts yet.</p>
                )}
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 overflow-x-hidden overflow-y-auto px-4 py-8 lg:px-8 xl:h-full">
          <div>
            <div
              data-viewport={previewMode}
              className={`mx-auto transition-all duration-300 ${previewFrameShellClass(previewMode)}`}
            >
              <article className="rounded-[36px] border border-stone bg-ivory shadow-[0_24px_90px_rgba(17,17,17,0.08)]">
                <section
                  onClick={() => setSelectedBlockId("hero")}
                  className={`rounded-t-[36px] border-b border-stone ${previewMode === "mobile" ? "p-5" : previewMode === "tablet" ? "p-7" : "p-7 sm:p-10"} ${selectedBlockId === "hero" ? "ring-2 ring-inset ring-teal/55" : ""}`}
                >
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal">
                    <label className="inline-flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                      <span className="text-teal/80">Category</span>
                      <select
                        value={draft.category}
                        onChange={(event) => updateDraft({ ...draft, category: event.target.value as ArticleCategory })}
                        className="focus-ring rounded-full border border-stone bg-ivory px-3 py-1.5 text-xs font-semibold normal-case tracking-normal text-charcoal"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </label>
                    <span className="h-px w-8 bg-stone" />
                    <span>{estimateReadTime(draft.content_blocks)} min read</span>
                  </div>
                  <EditableText
                    className={previewTitleClasses(previewMode, "mt-4")}
                    value={draft.title}
                    placeholder="Article title"
                    onChange={(title) => updateDraft({ ...draft, title, slug: draft.slug.startsWith("untitled-article") ? slugify(title) : draft.slug })}
                  />
                  <EditableText
                    className={previewSubtitleClasses(previewMode, "mt-5 max-w-2xl text-charcoal/76")}
                    value={draft.subtitle ?? ""}
                    placeholder="Add a sharp subtitle"
                    multiline
                    onChange={(subtitle) => updateDraft({ ...draft, subtitle })}
                  />
                  {draft.hero_image_url ? (
                    <div
                      className="mt-8 aspect-[16/9] overflow-hidden rounded-[28px] border border-stone bg-paper"
                      onDrop={(event) => {
                        event.preventDefault();
                        const url = event.dataTransfer.getData("text/plain");
                        if (url) updateDraft({ ...draft, hero_image_url: url });
                      }}
                      onDragOver={(event) => event.preventDefault()}
                    >
                      <img src={draft.hero_image_url} alt={draft.hero_image_alt ?? ""} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = async () => {
                          const file = input.files?.[0];
                          if (!file) return;
                          const url = await uploadImage(file);
                          if (url) updateDraft({ ...draft, hero_image_url: url });
                        };
                        input.click();
                      }}
                      className="focus-ring mt-8 flex aspect-[16/8] w-full items-center justify-center rounded-[28px] border border-dashed border-teal/60 bg-paper text-sm font-semibold text-teal"
                    >
                      Add hero image
                    </button>
                  )}
                </section>

                <DocumentCanvas
                  articleId={draft.id}
                  initialHtml={blocksToDocumentHtml(draft.content_blocks)}
                  uploadImage={uploadImage}
                  uploadVideo={uploadVideo}
                  insertMediaRef={insertMediaRef}
                  onChange={(html) => updateDraft({ ...draft, content_blocks: documentHtmlToBlocks(html) })}
                />
              </article>
            </div>
          </div>
        </main>

        <aside className="min-w-0 overflow-x-hidden border-l border-stone bg-paper/78 xl:h-full xl:overflow-y-auto">
          <div className="p-4 pb-12">
            <DocumentSidePanel
              draft={draft}
              updateDraft={updateDraft}
              uploadImage={uploadImage}
              uploadVideo={uploadVideo}
              mediaItems={mediaItems}
              setMediaItems={setMediaItems}
              insertMedia={insertMediaRef}
            />
          </div>
        </aside>
      </div>

      {showImport && (
        <Modal title="Structure Article" onClose={() => setShowImport(false)}>
          <p className="text-sm leading-6 text-charcoal/70">
            Paste a dense draft. This keeps the wording, then organizes it into a title, intro, sections, pull quote, takeaway, and references where it can.
          </p>
          <textarea
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            rows={16}
            className="focus-ring mt-5 w-full rounded-[24px] border border-stone bg-ivory p-4 text-base leading-7"
            placeholder="Paste the article here..."
          />
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={() => setShowImport(false)} className="focus-ring rounded-full border border-stone px-5 py-3 text-sm font-semibold text-charcoal">
              Cancel
            </button>
            <button type="button" onClick={applyStructure} className="focus-ring rounded-full bg-ink px-5 py-3 text-sm font-semibold text-ivory">
              Structure Draft
            </button>
          </div>
        </Modal>
      )}

      {showImprove && (
        <Modal title="Improve Layout" onClose={() => setShowImprove(false)}>
          <div className="space-y-3">
            {layoutSuggestions.length ? layoutSuggestions.map((suggestion) => (
              <div key={suggestion.title} className="rounded-[24px] border border-stone bg-paper p-4">
                <h3 className="font-serif text-2xl text-ink">{suggestion.title}</h3>
                <p className="mt-2 text-sm leading-6 text-charcoal/70">{suggestion.body}</p>
                <button type="button" onClick={suggestion.apply} className="focus-ring mt-4 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-ivory">
                  Apply
                </button>
              </div>
            )) : (
              <p className="rounded-[24px] border border-stone bg-paper p-5 text-sm leading-6 text-charcoal/70">
                This draft already has a readable structure. Add images or callouts where the article needs more visual rhythm.
              </p>
            )}
          </div>
        </Modal>
      )}

    </div>
  );
}

function DocumentCanvas({
  articleId,
  initialHtml,
  uploadImage,
  uploadVideo,
  insertMediaRef,
  onChange
}: {
  articleId: string;
  initialHtml: string;
  uploadImage: (file: File) => Promise<string | null>;
  uploadVideo: (file: File) => Promise<string | null>;
  insertMediaRef?: React.MutableRefObject<(url: string, isVideo: boolean) => void>;
  onChange: (html: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const draggedFigureRef = useRef<HTMLElement | null>(null);
  const initialHtmlRef = useRef(initialHtml || "<p></p>");
  const historyRef = useRef<string[]>([]);
  const redoRef = useRef<string[]>([]);
  const lastHtmlRef = useRef(initialHtml || "<p></p>");
  const tripleClickRef = useRef<{ count: number; time: number; target: EventTarget | null }>({ count: 0, time: 0, target: null });
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const selectedFigureRef = useRef<HTMLElement | null>(null);
  const copiedFigureHtmlRef = useRef<string | null>(null);
  const copiedImageSrcRef = useRef<string | null>(null);
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState<{ x: number; y: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [mediaToolbar, setMediaToolbar] = useState<{
    x: number;
    y: number;
    isImage: boolean;
    layout: ImageLayout;
  } | null>(null);
  const [mediaFrame, setMediaFrame] = useState<DOMRect | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ x: number; y: number; width: number } | null>(null);
  const mediaInteractionRef = useRef<{
    kind: "resize" | "move";
    handle?: ResizeHandle;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    aspectRatio: number;
  } | null>(null);
  const [fontSizePx, setFontSizePx] = useState(18);
  const [toolbarState, setToolbarState] = useState({ bold: false, italic: false, block: "p" });

  useEffect(() => {
    initialHtmlRef.current = initialHtml || "<p></p>";
  }, [initialHtml]);

  useEffect(() => {
    if (!insertMediaRef) return;
    insertMediaRef.current = (url: string, isVideo: boolean) => {
      const escapedUrl = escapeHtml(url);
      const figure = insertHtml(
        isVideo
          ? `<figure class="doc-video"><video src="${escapedUrl}" controls playsinline></video></figure><p></p>`
          : `<figure class="doc-image doc-image-right"><img src="${escapedUrl}" alt=""></figure><p></p>`
      );
      if (figure) selectFigure(figure);
    };
  });

  useEffect(() => {
    const nextHtml = initialHtmlRef.current;
    if (editorRef.current) {
      editorRef.current.innerHTML = nextHtml;
    }
    lastHtmlRef.current = nextHtml;
    historyRef.current = [nextHtml];
    redoRef.current = [];
    setToolbarOpen(false);
    setToolbarPosition(null);
    paintSavedSelection(null);
    setContextMenu(null);
    clearFigureSelection();
  }, [articleId]);

  useEffect(() => {
    if (!mediaToolbar) return;

    function dismissOnPointerDown(event: PointerEvent) {
      if (mediaInteractionRef.current) return;
      const target = event.target as HTMLElement;
      if (target.closest("[data-media-overlay], [data-media-toolbar], .document-editor figure")) return;
      clearFigureSelection();
    }

    document.addEventListener("pointerdown", dismissOnPointerDown);
    return () => document.removeEventListener("pointerdown", dismissOnPointerDown);
  }, [mediaToolbar]);

  useEffect(() => {
    if (!mediaToolbar) return;

    function refreshMediaToolbarPosition() {
      refreshMediaFrame();
    }

    window.addEventListener("scroll", refreshMediaToolbarPosition, true);
    window.addEventListener("resize", refreshMediaToolbarPosition);
    return () => {
      window.removeEventListener("scroll", refreshMediaToolbarPosition, true);
      window.removeEventListener("resize", refreshMediaToolbarPosition);
    };
  }, [mediaToolbar]);

  useEffect(() => {
    if (!contextMenu) return;

    function dismissOnPointerDown(event: PointerEvent) {
      if (contextMenuRef.current?.contains(event.target as Node)) return;
      setContextMenu(null);
    }

    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setContextMenu(null);
    }

    function dismissOnScroll() {
      setContextMenu(null);
    }

    document.addEventListener("pointerdown", dismissOnPointerDown);
    document.addEventListener("keydown", dismissOnEscape);
    window.addEventListener("scroll", dismissOnScroll, true);

    return () => {
      document.removeEventListener("pointerdown", dismissOnPointerDown);
      document.removeEventListener("keydown", dismissOnEscape);
      window.removeEventListener("scroll", dismissOnScroll, true);
    };
  }, [contextMenu]);

  function getEditorScrollParent() {
    return editorRef.current?.closest("main") as HTMLElement | null;
  }

  function captureEditorScroll() {
    return getEditorScrollParent()?.scrollTop ?? 0;
  }

  function restoreEditorScroll(scrollTop: number) {
    const scrollParent = getEditorScrollParent();
    if (scrollParent) scrollParent.scrollTop = scrollTop;
  }

  function isRangeInEditor(range: Range | null) {
    if (!range || !editorRef.current) return false;
    return editorRef.current.contains(range.commonAncestorContainer);
  }

  function ensureInsertionRange() {
    if (isRangeInEditor(savedRangeRef.current)) return;
    if (!editorRef.current) return;

    const range = document.createRange();
    const lastChild = editorRef.current.lastElementChild;
    if (lastChild) {
      range.selectNodeContents(lastChild);
      range.collapse(false);
    } else {
      range.setStart(editorRef.current, 0);
      range.collapse(true);
    }
    savedRangeRef.current = range;
  }

  function revealInsertedElement(element: HTMLElement, scrollTop: number) {
    restoreEditorScroll(scrollTop);
    element.scrollIntoView({ block: "nearest", behavior: "instant" });
    restoreEditorScroll(scrollTop);
  }

  function persist() {
    const next = editorRef.current?.innerHTML ?? "";
    lastHtmlRef.current = next;
    const stack = historyRef.current;
    if (stack[stack.length - 1] !== next) {
      historyRef.current = [...stack.slice(-80), next];
    }
    onChange(next);
    requestAnimationFrame(markMediaDraggable);
  }

  function rememberCurrentHtml() {
    const current = editorRef.current?.innerHTML ?? "";
    const stack = historyRef.current;
    if (stack[stack.length - 1] !== current) {
      historyRef.current = [...stack.slice(-80), current];
      redoRef.current = [];
    }
  }

  function restoreHtml(next: string) {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = next;
    lastHtmlRef.current = next;
    onChange(next);
    requestAnimationFrame(markMediaDraggable);
  }

  function undoEdit() {
    const current = editorRef.current?.innerHTML ?? "";
    const stack = historyRef.current;
    if (stack.length <= 1) return;
    const previous = stack[stack.length - 2];
    historyRef.current = stack.slice(0, -1);
    redoRef.current = [current, ...redoRef.current];
    restoreHtml(previous);
  }

  function redoEdit() {
    const [next, ...rest] = redoRef.current;
    if (!next) return;
    historyRef.current = [...historyRef.current, next];
    redoRef.current = rest;
    restoreHtml(next);
  }

  function markMediaDraggable() {
    editorRef.current?.querySelectorAll("figure").forEach((figure) => {
      normalizeMediaFigure(figure as HTMLElement);
    });
  }

  function clearFigureSelection() {
    editorRef.current?.querySelectorAll(".doc-media-selected, .doc-media-moving").forEach((figure) => {
      figure.classList.remove("doc-media-selected", "doc-media-moving");
      figure.setAttribute("draggable", "false");
    });
    selectedFigureRef.current = null;
    setMediaToolbar(null);
    setMediaFrame(null);
    setDropIndicator(null);
    mediaInteractionRef.current = null;
  }

  function refreshMediaFrame() {
    const figure = selectedFigureRef.current;
    if (!figure || !editorRef.current?.contains(figure)) {
      clearFigureSelection();
      return;
    }
    const rect = figure.getBoundingClientRect();
    setMediaFrame(rect);
    setMediaToolbar((current) =>
      current
        ? {
            ...current,
            x: Math.min(Math.max(rect.left + rect.width / 2, 180), window.innerWidth - 180),
            y: Math.max(rect.top - 10, 56),
            isImage: Boolean(figure.querySelector("img")),
            layout: getFigureLayout(figure)
          }
        : current
    );
  }

  function computeResizedDimensions(
    handle: ResizeHandle,
    startWidth: number,
    startHeight: number,
    aspectRatio: number,
    dx: number,
    dy: number,
    maxWidth: number
  ) {
    const corners = new Set<ResizeHandle>(["nw", "ne", "sw", "se"]);
    let width = startWidth;
    let height = startHeight;

    if (corners.has(handle)) {
      if (handle === "se" || handle === "ne") width = startWidth + dx;
      if (handle === "sw" || handle === "nw") width = startWidth - dx;
      width = Math.max(96, Math.min(width, maxWidth));
      height = width / aspectRatio;
    } else {
      if (handle.includes("e")) width = startWidth + dx;
      if (handle.includes("w")) width = startWidth - dx;
      if (handle.includes("s")) height = startHeight + dy;
      if (handle.includes("n")) height = startHeight - dy;
      width = Math.max(96, Math.min(width, maxWidth));
      height = Math.max(72, height);
    }

    return { width, height };
  }

  function updateDropIndicator(clientX: number, clientY: number) {
    const range = rangeFromPoint(clientX, clientY);
    if (!range || !editorRef.current?.contains(range.commonAncestorContainer)) {
      setDropIndicator(null);
      return;
    }
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current.getBoundingClientRect();
    setDropIndicator({
      x: Math.max(editorRect.left + 8, rect.left),
      y: clientY > rect.top + rect.height / 2 ? rect.bottom : rect.top,
      width: Math.min(Math.max(rect.width, 120), editorRect.width - 16)
    });
  }

  function moveFigureToPoint(figure: HTMLElement, clientX: number, clientY: number) {
    const editor = editorRef.current;
    if (!editor) return;
    const range = rangeFromPoint(clientX, clientY);
    if (!range || !editor.contains(range.commonAncestorContainer) || rangeTouchesFigure(range, figure)) return;

    rememberCurrentHtml();
    figure.remove();

    const layout = getFigureLayout(figure);
    const prefersInline = layout === "left" || layout === "right";
    const { textBlock, block } = caretContextFromRange(range, editor);

    if (prefersInline && textBlock?.tagName === "P") {
      const inlineRange = range.cloneRange();
      inlineRange.collapse(true);
      if (!rangeTouchesFigure(inlineRange, figure) && !inlineRange.startContainer.parentElement?.closest("figure")) {
        inlineRange.insertNode(figure);
        ensureSpacingAfterFigure(figure);
        figure.classList.remove("doc-media-moving");
        persist();
        selectFigure(figure);
        return;
      }
    }

    const placementBlock = block ?? textBlock;
    if (placementBlock && placementBlock !== figure) {
      const rect = placementBlock.getBoundingClientRect();
      const insertAfter = clientY > rect.top + rect.height / 2;
      if (insertAfter) placementBlock.insertAdjacentElement("afterend", figure);
      else placementBlock.insertAdjacentElement("beforebegin", figure);
      ensureBlockAfterFigure(figure);
      figure.classList.remove("doc-media-moving");
      persist();
      selectFigure(figure);
      return;
    }

    const collapsed = range.cloneRange();
    collapsed.collapse(true);
    collapsed.insertNode(figure);
    ensureBlockAfterFigure(figure);
    figure.classList.remove("doc-media-moving");
    persist();
    selectFigure(figure);
  }

  function beginFigureMove(clientX: number, clientY: number) {
    const figure = selectedFigureRef.current;
    if (!figure) return;
    rememberCurrentHtml();
    figure.classList.add("doc-media-moving");
    mediaInteractionRef.current = {
      kind: "move",
      startX: clientX,
      startY: clientY,
      startWidth: 0,
      startHeight: 0,
      aspectRatio: 1
    };
    updateDropIndicator(clientX, clientY);
    document.addEventListener("pointermove", handleMediaPointerMove);
    document.addEventListener("pointerup", endMediaInteraction);
    document.addEventListener("pointercancel", endMediaInteraction);
  }

  function endMediaInteraction(event: PointerEvent) {
    const session = mediaInteractionRef.current;
    const figure = selectedFigureRef.current;
    if (!session || !figure) return;

    if (session.kind === "move") {
      moveFigureToPoint(figure, event.clientX, event.clientY);
    } else {
      persist();
      refreshMediaFrame();
    }

    figure.classList.remove("doc-media-moving");
    setDropIndicator(null);
    mediaInteractionRef.current = null;
    document.removeEventListener("pointermove", handleMediaPointerMove);
    document.removeEventListener("pointerup", endMediaInteraction);
    document.removeEventListener("pointercancel", endMediaInteraction);
  }

  function handleMediaPointerMove(event: PointerEvent) {
    const session = mediaInteractionRef.current;
    const figure = selectedFigureRef.current;
    if (!session || !figure) return;

    const dx = event.clientX - session.startX;
    const dy = event.clientY - session.startY;

    if (session.kind === "resize" && session.handle) {
      const maxWidth = editorRef.current?.clientWidth ?? 900;
      const { width, height } = computeResizedDimensions(
        session.handle,
        session.startWidth,
        session.startHeight,
        session.aspectRatio,
        dx,
        dy,
        maxWidth
      );
      applyFigureSize(figure, width, height);
      refreshMediaFrame();
      return;
    }

    updateDropIndicator(event.clientX, event.clientY);
  }

  function startMediaResize(handle: ResizeHandle, event: React.PointerEvent<HTMLDivElement>) {
    const figure = selectedFigureRef.current;
    if (!figure) return;
    event.preventDefault();
    event.stopPropagation();
    rememberCurrentHtml();
    const metrics = getFigureMetrics(figure);
    mediaInteractionRef.current = {
      kind: "resize",
      handle,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: metrics.width,
      startHeight: metrics.height,
      aspectRatio: metrics.aspectRatio
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    document.addEventListener("pointermove", handleMediaPointerMove);
    document.addEventListener("pointerup", endMediaInteraction);
    document.addEventListener("pointercancel", endMediaInteraction);
  }

  function startMediaMove(event: React.PointerEvent<HTMLDivElement>) {
    const figure = selectedFigureRef.current;
    if (!figure) return;
    event.preventDefault();
    event.stopPropagation();
    beginFigureMove(event.clientX, event.clientY);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function selectFigure(figure: HTMLElement) {
    clearFigureSelection();
    normalizeMediaFigure(figure);
    figure.classList.add("doc-media-selected");
    figure.setAttribute("draggable", "true");
    selectedFigureRef.current = figure;
    setToolbarOpen(false);
    setToolbarPosition(null);
    paintSavedSelection(null);
    const rect = figure.getBoundingClientRect();
    setMediaFrame(rect);
    setMediaToolbar({
      x: Math.min(Math.max(rect.left + rect.width / 2, 180), window.innerWidth - 180),
      y: Math.max(rect.top - 10, 56),
      isImage: Boolean(figure.querySelector("img")),
      layout: getFigureLayout(figure)
    });
  }

  function deleteSelectedFigure() {
    const figure = selectedFigureRef.current;
    if (!figure) return;
    rememberCurrentHtml();
    const focusTarget = (figure.nextElementSibling ?? figure.previousElementSibling) as HTMLElement | null;
    figure.remove();
    clearFigureSelection();
    if (focusTarget && editorRef.current?.contains(focusTarget)) {
      const range = document.createRange();
      range.selectNodeContents(focusTarget);
      range.collapse(true);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      savedRangeRef.current = range.cloneRange();
    }
    persist();
  }

  function moveSelectedFigure(direction: "up" | "down") {
    const figure = selectedFigureRef.current;
    const parent = editorRef.current;
    if (!figure || !parent) return;
    const children = Array.from(parent.children);
    const index = children.indexOf(figure);
    if (index === -1) return;
    rememberCurrentHtml();
    if (direction === "up" && index > 0) {
      parent.insertBefore(figure, children[index - 1]);
    } else if (direction === "down" && index < children.length - 1) {
      parent.insertBefore(children[index + 1], figure);
    } else {
      return;
    }
    selectFigure(figure);
    persist();
  }

  function setSelectedFigureLayout(layout: ImageLayout) {
    const figure = selectedFigureRef.current;
    if (!figure?.querySelector("img")) return;
    rememberCurrentHtml();
    figure.classList.remove("doc-media-custom");
    figure.style.width = "";
    figure.style.height = "";
    const media = getFigureMedia(figure);
    if (media) {
      media.style.width = "";
      media.style.height = "";
      media.style.maxWidth = "";
      media.style.objectFit = "";
      media.style.aspectRatio = "";
    }
    applyFigureLayout(figure, layout);
    selectFigure(figure);
    persist();
  }

  async function copySelectedFigure() {
    const figure = selectedFigureRef.current;
    if (!figure) return;
    const html = figureCopyHtml(figure);
    const img = figure.querySelector("img");
    copiedFigureHtmlRef.current = html;
    copiedImageSrcRef.current = img?.src ?? null;
    if (img) {
      const blob = await imageBlobFromElement(img);
      if (blob) {
        try {
          const clipboardPayload: Record<string, Blob> = {
            [blob.type || "image/png"]: blob,
            "text/html": new Blob([html], { type: "text/html" })
          };
          await navigator.clipboard.write([new ClipboardItem(clipboardPayload)]);
          return;
        } catch {
          // Fall back to html-only copy below.
        }
      }
    }

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([html], { type: "text/plain" })
        })
      ]);
    } catch {
      try {
        await navigator.clipboard.writeText(html);
      } catch {
        // Clipboard may be unavailable; internal paste still works.
      }
    }
  }

  function duplicateSelectedFigure() {
    const figure = selectedFigureRef.current;
    if (!figure) return;
    rememberCurrentHtml();
    const clone = figure.cloneNode(true) as HTMLElement;
    clone.classList.remove("doc-media-selected");
    normalizeMediaFigure(clone);
    figure.insertAdjacentElement("afterend", clone);
    if (!clone.nextElementSibling || clone.nextElementSibling.tagName !== "P") {
      clone.insertAdjacentHTML("afterend", "<p><br></p>");
    }
    selectFigure(clone);
    persist();
  }

  function pasteCopiedFigure() {
    const html = copiedFigureHtmlRef.current;
    if (!html) return;
    rememberCurrentHtml();
    const figure = selectedFigureRef.current;
    if (figure) {
      figure.insertAdjacentHTML("afterend", `${html}<p><br></p>`);
      const nextFigure = figure.nextElementSibling;
      if (nextFigure instanceof HTMLElement && nextFigure.tagName === "FIGURE") {
        selectFigure(nextFigure);
      }
    } else {
      insertHtml(`${html}<p></p>`);
    }
    persist();
  }

  function ensureEditableParagraph() {
    if (!editorRef.current) return;
    if (editorRef.current.textContent?.trim() || editorRef.current.querySelector("img, video, iframe")) return;
    editorRef.current.innerHTML = "<p><br></p>";
    const paragraph = editorRef.current.querySelector("p");
    if (!paragraph) return;
    const range = document.createRange();
    range.selectNodeContents(paragraph);
    range.collapse(true);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    savedRangeRef.current = range.cloneRange();
  }

  function saveCurrentSelection() {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    savedRangeRef.current = selection.getRangeAt(0).cloneRange();
  }

  function paintSavedSelection(range: Range | null) {
    const highlightApi = CSS as unknown as {
      highlights?: {
        set: (name: string, highlight: unknown) => void;
        delete: (name: string) => void;
      };
    };
    const highlightConstructor = (window as unknown as { Highlight?: new (...ranges: Range[]) => unknown }).Highlight;
    if (!highlightApi.highlights || !highlightConstructor) return;

    if (!range) {
      highlightApi.highlights.delete("tj-editor-selection");
      return;
    }

    highlightApi.highlights.set("tj-editor-selection", new highlightConstructor(range.cloneRange()));
  }

  function selectedElementForRange(range: Range) {
    return range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? range.commonAncestorContainer as Element
      : range.commonAncestorContainer.parentElement;
  }

  function firstSelectedElementForRange(range: Range) {
    if (range.commonAncestorContainer.nodeType === Node.TEXT_NODE) {
      return range.commonAncestorContainer.parentElement;
    }

    const walker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
        try {
          return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        } catch {
          return NodeFilter.FILTER_REJECT;
        }
      }
    });
    const firstTextNode = walker.nextNode();
    return firstTextNode?.parentElement ?? selectedElementForRange(range);
  }

  function refreshToolbarState(range: Range) {
    const selectedElement = firstSelectedElementForRange(range);
    const blockElement = selectedElement?.closest("h2, h3, p, blockquote, li");
    const computedFontSize = selectedElement ? Number.parseInt(window.getComputedStyle(selectedElement).fontSize, 10) : 18;
    if (Number.isFinite(computedFontSize)) setFontSizePx(computedFontSize);
    const computed = selectedElement ? window.getComputedStyle(selectedElement) : null;
    const fontWeight = computed ? Number.parseInt(computed.fontWeight, 10) : 400;
    setToolbarState({
      bold: Boolean(selectedElement?.closest("strong, b")) || fontWeight >= 600,
      italic: Boolean(selectedElement?.closest("em, i")) || computed?.fontStyle === "italic",
      block: blockElement?.tagName.toLowerCase() ?? "p"
    });
  }

  function updateFloatingToolbar() {
    if (selectedFigureRef.current) {
      setToolbarOpen(false);
      setToolbarPosition(null);
      paintSavedSelection(null);
      return;
    }

    const selection = window.getSelection();
    if (!selection?.rangeCount || !selection.toString().trim()) {
      setToolbarOpen(false);
      setToolbarPosition(null);
      paintSavedSelection(null);
      return;
    }

    const range = selection.getRangeAt(0).cloneRange();
    if (!editorRef.current?.contains(range.commonAncestorContainer)) {
      setToolbarOpen(false);
      setToolbarPosition(null);
      paintSavedSelection(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    if (!rect.width && !rect.height) {
      setToolbarOpen(false);
      setToolbarPosition(null);
      paintSavedSelection(null);
      return;
    }

    savedRangeRef.current = range;
    refreshToolbarState(range);
    paintSavedSelection(range);
    setToolbarOpen(true);
    setToolbarPosition({
      x: Math.min(Math.max(rect.left + rect.width / 2, 190), window.innerWidth - 190),
      y: Math.max(rect.top - 58, 12)
    });
  }

  function rangeFromPoint(x: number, y: number) {
    const doc = document as Document & {
      caretRangeFromPoint?: (x: number, y: number) => Range | null;
      caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
    };
    if (doc.caretRangeFromPoint) return doc.caretRangeFromPoint(x, y);
    const position = doc.caretPositionFromPoint?.(x, y);
    if (!position) return null;
    const range = document.createRange();
    range.setStart(position.offsetNode, position.offset);
    range.collapse(true);
    return range;
  }

  function placeCaretAtSavedRange({ focus = true, preventScroll = true }: { focus?: boolean; preventScroll?: boolean } = {}) {
    if (focus) editorRef.current?.focus({ preventScroll });
    const selection = window.getSelection();
    if (!selection || !savedRangeRef.current) return;
    selection.removeAllRanges();
    selection.addRange(savedRangeRef.current);
  }

  function insertHtml(htmlToInsert: string) {
    const scrollTop = captureEditorScroll();
    rememberCurrentHtml();
    ensureInsertionRange();
    placeCaretAtSavedRange({ focus: true, preventScroll: true });

    const marker = `${Date.now()}`;
    const markedHtml = htmlToInsert.includes("<figure")
      ? htmlToInsert.replace("<figure", `<figure data-tj-insert="${marker}"`)
      : htmlToInsert;
    document.execCommand("insertHTML", false, markedHtml);

    const inserted = editorRef.current?.querySelector(`figure[data-tj-insert="${marker}"]`) as HTMLElement | null;
    inserted?.removeAttribute("data-tj-insert");

    persist();
    setContextMenu(null);

    requestAnimationFrame(() => {
      if (inserted) revealInsertedElement(inserted, scrollTop);
      else restoreEditorScroll(scrollTop);
    });

    return inserted;
  }

  function applyParagraphFormat() {
    const range = savedRangeRef.current;
    if (!range || !editorRef.current) return;
    rememberCurrentHtml();
    placeCaretAtSavedRange({ preventScroll: true });
    const block = firstSelectedElementForRange(range)?.closest("h2, h3") as HTMLElement | null;
    if (block && editorRef.current.contains(block)) {
      const paragraph = document.createElement("p");
      paragraph.innerHTML = block.innerHTML || "<br>";
      block.replaceWith(paragraph);
      const nextRange = document.createRange();
      nextRange.selectNodeContents(paragraph);
      nextRange.collapse(false);
      savedRangeRef.current = nextRange;
      setToolbarState((current) => ({ ...current, block: "p" }));
    } else {
      document.execCommand("formatBlock", false, "p");
    }
    persist();
    window.setTimeout(updateFloatingToolbar, 0);
  }

  function applyHeadingFormat(level: "h2" | "h3") {
    const range = savedRangeRef.current;
    if (!range || !editorRef.current) return;

    rememberCurrentHtml();
    placeCaretAtSavedRange({ preventScroll: true });

    const selectedText = range.toString().trim();
    let heading: HTMLElement | null = null;

    if (!selectedText) {
      document.execCommand("formatBlock", false, level);
      heading = window.getSelection()?.anchorNode
        ? (window.getSelection()?.anchorNode as Node).parentElement?.closest(level) as HTMLElement | null
        : null;
    } else {
      const block = firstSelectedElementForRange(range)?.closest("p, h2, h3, blockquote, li") as HTMLElement | null;

      if (block && editorRef.current.contains(block) && block.textContent?.trim() === selectedText) {
        heading = document.createElement(level);
        heading.textContent = selectedText;
        block.replaceWith(heading);
      } else {
        const activeRange = window.getSelection()?.getRangeAt(0);
        if (!activeRange) return;
        activeRange.deleteContents();
        heading = document.createElement(level);
        heading.textContent = selectedText;
        activeRange.insertNode(heading);
        if (!heading.nextElementSibling || heading.nextElementSibling.tagName !== "P") {
          heading.insertAdjacentHTML("afterend", "<p><br></p>");
        }
      }
    }

    if (heading) {
      const nextRange = document.createRange();
      nextRange.selectNodeContents(heading);
      nextRange.collapse(false);
      savedRangeRef.current = nextRange;
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(nextRange);
    }

    setToolbarState((current) => ({ ...current, block: level }));
    persist();
    window.setTimeout(updateFloatingToolbar, 0);
  }

  function applyBlockFormat(value: "p" | "h2" | "h3") {
    if (value === "p") applyParagraphFormat();
    else applyHeadingFormat(value);
  }

  function runCommand(command: string, value?: string) {
    rememberCurrentHtml();
    placeCaretAtSavedRange({ preventScroll: true });
    document.execCommand(command, false, value);
    persist();
    window.setTimeout(updateFloatingToolbar, 0);
  }

  function applyExactFontSize(nextSize = fontSizePx) {
    if (!Number.isFinite(nextSize)) return;
    const clampedSize = Math.min(Math.max(Math.round(nextSize), 8), 96);
    const range = savedRangeRef.current;
    if (!range || range.collapsed) return;
    setFontSizePx(clampedSize);
    rememberCurrentHtml();
    const selectedElement = firstSelectedElementForRange(range);
    const existingFontSpan = selectedElement?.closest("span") as HTMLSpanElement | null;
    const selectedText = range.toString();

    if (existingFontSpan?.style.fontSize && existingFontSpan.textContent === selectedText) {
      existingFontSpan.style.fontSize = `${clampedSize}px`;
      const nextRange = document.createRange();
      nextRange.selectNodeContents(existingFontSpan);
      savedRangeRef.current = nextRange;
    } else {
      const wrapper = document.createElement("span");
      wrapper.style.fontSize = `${clampedSize}px`;
      wrapper.appendChild(range.extractContents());
      range.insertNode(wrapper);
      const nextRange = document.createRange();
      nextRange.selectNodeContents(wrapper);
      savedRangeRef.current = nextRange;
    }

    paintSavedSelection(savedRangeRef.current);
    persist();
    if (savedRangeRef.current) refreshToolbarState(savedRangeRef.current);
  }

  async function insertImage() {
    setContextMenu(null);
    saveCurrentSelection();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const url = await uploadImage(file);
      if (!url) return;
      const figure = insertHtml(`<figure class="doc-image doc-image-right"><img src="${escapeHtml(url)}" alt=""></figure><p></p>`);
      if (figure) selectFigure(figure);
    };
    input.click();
  }

  async function uploadVideoHere() {
    setContextMenu(null);
    saveCurrentSelection();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const url = await uploadVideo(file);
      if (!url) return;
      const figure = insertHtml(`<figure class="doc-video"><video src="${escapeHtml(url)}" controls playsinline></video></figure><p></p>`);
      if (figure) selectFigure(figure);
    };
    input.click();
  }

  async function uploadVideoOnlyHere() {
    await uploadVideoHere();
    setContextMenu(null);
  }

  function handleContextMenu(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    const figure = findMediaFigure(event.target);
    if (figure && editorRef.current?.contains(figure)) {
      selectFigure(figure);
    } else {
      const range = rangeFromPoint(event.clientX, event.clientY);
      if (range && editorRef.current?.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range;
      } else {
        saveCurrentSelection();
      }
    }
    setContextMenu({ x: event.clientX, y: event.clientY });
  }

  async function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    rememberCurrentHtml();
    const imageFile = clipboardImageFile(event);
    const htmlData = event.clipboardData.getData("text/html");
    const isInternalMediaPaste = Boolean(
      copiedFigureHtmlRef.current &&
      copiedImageSrcRef.current &&
      (htmlData.includes(copiedImageSrcRef.current) || (!htmlData && imageFile))
    );

    if (imageFile || (copiedFigureHtmlRef.current && htmlData.includes("<figure"))) {
      event.preventDefault();
      saveCurrentSelection();
      if (isInternalMediaPaste) {
        pasteCopiedFigure();
        return;
      }
      if (imageFile) {
        const url = await uploadImage(imageFile);
        if (url) insertHtml(`<figure class="doc-image doc-image-right"><img src="${escapeHtml(url)}" alt=""></figure><p></p>`);
      } else if (copiedFigureHtmlRef.current) {
        pasteCopiedFigure();
      }
      return;
    }

    window.setTimeout(persist, 0);
  }

  function handleCopy(event: React.ClipboardEvent<HTMLDivElement>) {
    if (!selectedFigureRef.current) return;
    event.preventDefault();
    void copySelectedFigure();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const figure = selectedFigureRef.current;

    if (figure && (event.key === "Backspace" || event.key === "Delete")) {
      event.preventDefault();
      deleteSelectedFigure();
      return;
    }

    if ((event.metaKey || event.ctrlKey) && figure) {
      const key = event.key.toLowerCase();
      if (key === "c") {
        event.preventDefault();
        void copySelectedFigure();
        return;
      }
      if (key === "x") {
        event.preventDefault();
        void copySelectedFigure();
        deleteSelectedFigure();
        return;
      }
      if (key === "d") {
        event.preventDefault();
        duplicateSelectedFigure();
        return;
      }
    }

    if (!event.metaKey && !event.ctrlKey) return;
    const key = event.key.toLowerCase();
    if (key === "z") {
      event.preventDefault();
      if (event.shiftKey) redoEdit();
      else undoEdit();
    }
    if (key === "y") {
      event.preventDefault();
      redoEdit();
    }
  }

  function handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    const figure = findMediaFigure(event.target);
    if (figure && editorRef.current?.contains(figure)) {
      selectFigure(figure);
      event.preventDefault();

      const startX = event.clientX;
      const startY = event.clientY;
      let dragging = false;

      function onPointerMove(pointerEvent: PointerEvent) {
        if (!dragging && Math.hypot(pointerEvent.clientX - startX, pointerEvent.clientY - startY) > 6) {
          dragging = true;
          beginFigureMove(pointerEvent.clientX, pointerEvent.clientY);
        }
      }

      function onPointerUp() {
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
        document.removeEventListener("pointercancel", onPointerUp);
      }

      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
      document.addEventListener("pointercancel", onPointerUp);
      return;
    }

    clearFigureSelection();

    const now = Date.now();
    const previous = tripleClickRef.current;
    const count = previous.target === event.target && now - previous.time < 520 ? previous.count + 1 : 1;
    tripleClickRef.current = { count, time: now, target: event.target };
    if (count < 3) return;

    const target = event.target as HTMLElement;
    const paragraph = target.closest("p, h2, h3, blockquote, aside, li");
    if (!paragraph || !editorRef.current?.contains(paragraph)) return;
    event.preventDefault();
    const range = document.createRange();
    range.selectNodeContents(paragraph);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    savedRangeRef.current = range.cloneRange();
    const rect = paragraph.getBoundingClientRect();
    refreshToolbarState(range);
    paintSavedSelection(range);
    setToolbarOpen(true);
    setToolbarPosition({
      x: Math.min(Math.max(rect.left + rect.width / 2, 190), window.innerWidth - 190),
      y: Math.max(rect.top - 58, 12)
    });
  }

  function handleDragStart(event: React.DragEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const figure = target.closest("figure") as HTMLElement | null;
    if (!figure || !editorRef.current?.contains(figure)) return;
    selectFigure(figure);
    draggedFigureRef.current = figure;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-doc-media", figureCopyHtml(figure));
    updateDropIndicator(event.clientX, event.clientY);
  }

  async function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    const imageFile = Array.from(event.dataTransfer.files).find((file) => file.type.startsWith("image/"));
    const droppedUrl = event.dataTransfer.getData("text/plain");
    const mediaHtml = event.dataTransfer.getData("application/x-doc-media");
    if (!imageFile && !mediaHtml && !droppedUrl) return;
    event.preventDefault();
    rememberCurrentHtml();

    const range = rangeFromPoint(event.clientX, event.clientY);
    if (range) savedRangeRef.current = range;

    if (imageFile) {
      const url = await uploadImage(imageFile);
      if (url) insertHtml(`<figure class="doc-image doc-image-right"><img src="${escapeHtml(url)}" alt=""></figure><p></p>`);
      return;
    }

    if (droppedUrl && !mediaHtml) {
      const escapedUrl = escapeHtml(droppedUrl);
      const isVideo = /\.(mp4|webm|mov)(\?|#|$)/i.test(droppedUrl);
      insertHtml(
        isVideo
          ? `<figure class="doc-video"><video src="${escapedUrl}" controls playsinline></video></figure><p></p>`
          : `<figure class="doc-image doc-image-right"><img src="${escapedUrl}" alt=""></figure><p></p>`
      );
      return;
    }

    if (mediaHtml && draggedFigureRef.current) {
      moveFigureToPoint(draggedFigureRef.current, event.clientX, event.clientY);
      draggedFigureRef.current = null;
      setDropIndicator(null);
      return;
    }

    if (mediaHtml) {
      insertHtml(`${mediaHtml}<p></p>`);
      draggedFigureRef.current = null;
      setDropIndicator(null);
    }
  }

  const mediaButtonClass = (active = false) =>
    `focus-ring rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition ${
      active
        ? "border-ink bg-ink text-ivory"
        : "border-stone bg-paper text-charcoal hover:border-teal"
    }`;
  const mediaDangerButtonClass =
    "focus-ring rounded-full border border-red-300 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-700 transition hover:border-red-400";

  const toolbarButtonClass = (active = false) =>
    `focus-ring rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
      active
        ? "border-ink bg-ink text-ivory"
        : "border-stone bg-paper text-charcoal hover:border-teal"
    }`;
  const toolbarBlockValue = toolbarState.block === "h2" || toolbarState.block === "h3" ? toolbarState.block : "p";
  const visibleFontSizes = fontSizeOptions.includes(fontSizePx) ? fontSizeOptions : [fontSizePx, ...fontSizeOptions].sort((a, b) => a - b);

  return (
    <div className="px-5 pb-10 sm:px-10">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="document-editor min-h-[520px] rounded-[26px] border border-transparent px-1 py-2 outline-none focus:border-teal/40"
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
        onFocus={ensureEditableParagraph}
        onBeforeInput={rememberCurrentHtml}
        onMouseUp={() => {
          saveCurrentSelection();
          window.setTimeout(updateFloatingToolbar, 0);
        }}
        onKeyDown={handleKeyDown}
        onKeyUp={() => {
          saveCurrentSelection();
          window.setTimeout(updateFloatingToolbar, 0);
        }}
        onPaste={(event) => {
          void handlePaste(event);
        }}
        onCopy={(event) => {
          void handleCopy(event);
        }}
        onDragStart={handleDragStart}
        onDragOver={(event) => {
          event.preventDefault();
          if (draggedFigureRef.current) updateDropIndicator(event.clientX, event.clientY);
        }}
        onDragLeave={() => setDropIndicator(null)}
        onDrop={(event) => {
          void handleDrop(event);
        }}
        onBlur={() => {
          saveCurrentSelection();
          persist();
        }}
        onInput={() => {
          window.setTimeout(persist, 0);
        }}
      />
      {mediaFrame && mediaToolbar && (
        <MediaResizeOverlay
          frame={mediaFrame}
          dropIndicator={dropIndicator}
          onMovePointerDown={startMediaMove}
          onResizePointerDown={startMediaResize}
        />
      )}
      {mediaToolbar && (
        <div
          data-media-toolbar=""
          className="fixed z-[60] flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-1 rounded-[20px] border border-stone bg-ivory/98 p-1.5 shadow-[0_16px_48px_rgba(17,17,17,0.16)] backdrop-blur"
          style={{ left: mediaToolbar.x, top: mediaToolbar.y, transform: "translate(-50%, -100%)" }}
          onMouseDown={(event) => event.preventDefault()}
        >
          <button type="button" onClick={() => moveSelectedFigure("up")} className={mediaButtonClass()} title="Move up">
            ↑ Up
          </button>
          <button type="button" onClick={() => moveSelectedFigure("down")} className={mediaButtonClass()} title="Move down">
            ↓ Down
          </button>
          <span className="px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-charcoal/45">Drag to move</span>
          {mediaToolbar.isImage && (
            <>
              <span className="mx-0.5 h-5 w-px bg-stone" />
              <button type="button" onClick={() => setSelectedFigureLayout("left")} className={mediaButtonClass(mediaToolbar.layout === "left")} title="Float left">
                Left
              </button>
              <button type="button" onClick={() => setSelectedFigureLayout("center")} className={mediaButtonClass(mediaToolbar.layout === "center")} title="Center">
                Center
              </button>
              <button type="button" onClick={() => setSelectedFigureLayout("right")} className={mediaButtonClass(mediaToolbar.layout === "right")} title="Float right">
                Right
              </button>
              <button type="button" onClick={() => setSelectedFigureLayout("full")} className={mediaButtonClass(mediaToolbar.layout === "full")} title="Full width">
                Full
              </button>
            </>
          )}
          <span className="mx-0.5 h-5 w-px bg-stone" />
          <button type="button" onClick={() => void copySelectedFigure()} className={mediaButtonClass()} title="Copy (⌘C)">
            Copy
          </button>
          <button type="button" onClick={duplicateSelectedFigure} className={mediaButtonClass()} title="Duplicate (⌘D)">
            Duplicate
          </button>
          <button type="button" onClick={deleteSelectedFigure} className={mediaDangerButtonClass} title="Delete">
            Delete
          </button>
        </div>
      )}
      {toolbarOpen && toolbarPosition && (
        <div
          className="fixed z-50 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-1 rounded-full border border-stone bg-ivory/98 p-1 shadow-[0_16px_48px_rgba(17,17,17,0.16)] backdrop-blur"
          style={{ left: toolbarPosition.x, top: toolbarPosition.y }}
          onMouseDown={(event) => {
            if ((event.target as HTMLElement).tagName !== "SELECT") event.preventDefault();
          }}
        >
          <div className="flex items-center rounded-full border border-stone bg-paper px-3 py-1 text-xs font-semibold text-charcoal">
            <label className="flex items-center gap-1">
              Style
              <select
                value={toolbarBlockValue}
                onChange={(event) => applyBlockFormat(event.target.value as "p" | "h2" | "h3")}
                className="max-w-[7.5rem] bg-transparent outline-none"
              >
                <option value="p">Paragraph</option>
                <option value="h2">Heading</option>
                <option value="h3">Subheading</option>
              </select>
            </label>
          </div>
          <button type="button" onClick={() => runCommand("bold")} className={toolbarButtonClass(toolbarState.bold)}>
            Bold
          </button>
          <button type="button" onClick={() => runCommand("italic")} className={toolbarButtonClass(toolbarState.italic)}>
            Italic
          </button>
          {toolbarBlockValue === "p" && (
            <div className="flex items-center rounded-full border border-stone bg-paper px-3 py-1 text-xs font-semibold text-charcoal">
              <label className="flex items-center gap-1">
                Size
                <select
                  value={fontSizePx}
                  onChange={(event) => {
                    const nextSize = Number(event.target.value);
                    if (Number.isFinite(nextSize)) applyExactFontSize(nextSize);
                  }}
                  className="bg-transparent text-center outline-none"
                >
                  {visibleFontSizes.map((size) => (
                    <option key={size} value={size}>{size}px</option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>
      )}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 w-52 overflow-hidden rounded-[18px] border border-stone bg-ivory p-1 shadow-[0_18px_60px_rgba(17,17,17,0.18)]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {selectedFigureRef.current ? (
            <>
              <button type="button" onClick={() => moveSelectedFigure("up")} className="focus-ring block w-full rounded-[14px] px-3 py-2 text-left text-sm font-semibold text-charcoal hover:bg-paper">
                Move up
              </button>
              <button type="button" onClick={() => moveSelectedFigure("down")} className="focus-ring block w-full rounded-[14px] px-3 py-2 text-left text-sm font-semibold text-charcoal hover:bg-paper">
                Move down
              </button>
              {selectedFigureRef.current.querySelector("img") && (
                <>
                  <button type="button" onClick={() => { setSelectedFigureLayout("left"); setContextMenu(null); }} className="focus-ring block w-full rounded-[14px] px-3 py-2 text-left text-sm font-semibold text-charcoal hover:bg-paper">
                    Float left
                  </button>
                  <button type="button" onClick={() => { setSelectedFigureLayout("center"); setContextMenu(null); }} className="focus-ring block w-full rounded-[14px] px-3 py-2 text-left text-sm font-semibold text-charcoal hover:bg-paper">
                    Center image
                  </button>
                  <button type="button" onClick={() => { setSelectedFigureLayout("right"); setContextMenu(null); }} className="focus-ring block w-full rounded-[14px] px-3 py-2 text-left text-sm font-semibold text-charcoal hover:bg-paper">
                    Float right
                  </button>
                  <button type="button" onClick={() => { setSelectedFigureLayout("full"); setContextMenu(null); }} className="focus-ring block w-full rounded-[14px] px-3 py-2 text-left text-sm font-semibold text-charcoal hover:bg-paper">
                    Full width
                  </button>
                </>
              )}
              <button type="button" onClick={() => { void copySelectedFigure(); setContextMenu(null); }} className="focus-ring block w-full rounded-[14px] px-3 py-2 text-left text-sm font-semibold text-charcoal hover:bg-paper">
                Copy
              </button>
              <button type="button" onClick={() => { duplicateSelectedFigure(); setContextMenu(null); }} className="focus-ring block w-full rounded-[14px] px-3 py-2 text-left text-sm font-semibold text-charcoal hover:bg-paper">
                Duplicate
              </button>
              <button type="button" onClick={() => { deleteSelectedFigure(); setContextMenu(null); }} className="focus-ring block w-full rounded-[14px] px-3 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-50">
                Delete
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => { applyHeadingFormat("h2"); setContextMenu(null); }} className="focus-ring block w-full rounded-[14px] px-3 py-2 text-left text-sm font-semibold text-charcoal hover:bg-paper">
                Make heading
              </button>
              <button type="button" onClick={() => { applyHeadingFormat("h3"); setContextMenu(null); }} className="focus-ring block w-full rounded-[14px] px-3 py-2 text-left text-sm font-semibold text-charcoal hover:bg-paper">
                Make subheading
              </button>
              <button type="button" onClick={() => { applyParagraphFormat(); setContextMenu(null); }} className="focus-ring block w-full rounded-[14px] px-3 py-2 text-left text-sm font-semibold text-charcoal hover:bg-paper">
                Make paragraph
              </button>
              <button type="button" onClick={insertImage} className="focus-ring block w-full rounded-[14px] px-3 py-2 text-left text-sm font-semibold text-charcoal hover:bg-paper">
                Upload image here
              </button>
              <button type="button" onClick={() => void uploadVideoOnlyHere()} className="focus-ring block w-full rounded-[14px] px-3 py-2 text-left text-sm font-semibold text-charcoal hover:bg-paper">
                Upload video here
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DocumentSidePanel({
  draft,
  updateDraft,
  uploadImage,
  uploadVideo,
  mediaItems,
  setMediaItems,
  insertMedia
}: {
  draft: Article;
  updateDraft: (article: Article) => void;
  uploadImage: (file: File) => Promise<string | null>;
  uploadVideo: (file: File) => Promise<string | null>;
  mediaItems: string[];
  setMediaItems: (items: string[]) => void;
  insertMedia: React.MutableRefObject<(url: string, isVideo: boolean) => void>;
}) {
  async function uploadToLibrary(kind: "image" | "video") {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = kind === "image" ? "image/*" : "video/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const url = kind === "image" ? await uploadImage(file) : await uploadVideo(file);
      if (url) setMediaItems([url, ...mediaItems.filter((item) => item !== url)]);
    };
    input.click();
  }

  function addMediaUrl() {
    const url = window.prompt("Paste an image or video URL");
    if (!url?.trim()) return;
    setMediaItems([url.trim(), ...mediaItems.filter((item) => item !== url.trim())]);
  }

  function isVideoUrl(url: string) {
    return /\.(mp4|webm|mov)(\?|#|$)/i.test(url);
  }

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal">Document</p>
        <h2 className="mt-2 font-serif text-3xl text-ink">Media</h2>
        <p className="mt-2 text-sm leading-6 text-charcoal/62">
          Upload or paste media here, then click to insert or drag it into the article.
        </p>
      </div>

      <div className="grid gap-2">
        <button type="button" onClick={() => void uploadToLibrary("image")} className="focus-ring rounded-full bg-ink px-4 py-3 text-sm font-semibold text-ivory">
          Upload image
        </button>
        <button type="button" onClick={() => void uploadToLibrary("video")} className="focus-ring rounded-full border border-stone bg-ivory px-4 py-3 text-sm font-semibold text-charcoal hover:border-teal">
          Upload video
        </button>
        <button type="button" onClick={addMediaUrl} className="focus-ring rounded-full border border-stone bg-ivory px-4 py-3 text-sm font-semibold text-charcoal hover:border-teal">
          Add media link
        </button>
      </div>

      <div className="rounded-[24px] border border-stone bg-ivory p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-charcoal/58">Cover image</p>
        {draft.hero_image_url && <img src={draft.hero_image_url} alt="" className="mt-3 aspect-[16/9] w-full rounded-[18px] object-cover" />}
        <button
          type="button"
          onClick={() => void uploadToLibrary("image")}
          className="focus-ring mt-3 w-full rounded-full border border-stone bg-paper px-4 py-2 text-sm font-semibold text-charcoal hover:border-teal"
        >
          Upload to library
        </button>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Library</p>
        {mediaItems.length ? (
          mediaItems.map((url) => {
            const isVideo = isVideoUrl(url);
            return (
              <div key={url} className="overflow-hidden rounded-[22px] border border-stone bg-ivory">
                <button
                  type="button"
                  draggable
                  onClick={() => insertMedia.current(url, isVideo)}
                  onDragStart={(event) => event.dataTransfer.setData("text/plain", url)}
                  className="block w-full cursor-pointer text-left active:cursor-grabbing"
                >
                  {isVideo ? (
                    <div className="flex aspect-[16/9] items-center justify-center bg-navy text-sm font-semibold text-ivory/80">Video</div>
                  ) : (
                    <img src={url} alt="" className="aspect-[16/9] w-full object-cover" />
                  )}
                </button>
                <div className="flex items-center gap-2 p-2">
                  {!isVideo && (
                    <button type="button" onClick={() => updateDraft({ ...draft, hero_image_url: url })} className="focus-ring rounded-full border border-stone px-3 py-1.5 text-xs font-semibold text-charcoal hover:border-teal">
                      Use cover
                    </button>
                  )}
                  <button type="button" onClick={() => insertMedia.current(url, isVideo)} className="focus-ring rounded-full border border-stone px-3 py-1.5 text-xs font-semibold text-charcoal hover:border-teal">
                    Insert
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="rounded-[22px] border border-stone bg-ivory p-4 text-sm leading-6 text-charcoal/65">
            Uploaded media will show here.
          </p>
        )}
      </div>
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-[34px] border border-stone bg-ivory p-6 shadow-[0_30px_100px_rgba(17,17,17,0.28)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="font-serif text-5xl leading-tight text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="focus-ring rounded-full border border-stone px-4 py-2 text-sm font-semibold text-charcoal">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
