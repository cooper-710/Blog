export type PreviewViewport = "desktop" | "tablet" | "mobile";

export function previewFrameWidth(viewport: PreviewViewport, context: "editor" | "page" = "editor") {
  if (viewport === "mobile") return "max-w-[430px]";
  if (viewport === "tablet") return "max-w-[760px]";
  return context === "editor" ? "max-w-[900px]" : "w-full";
}

export function previewFrameShellClass(viewport: PreviewViewport, context: "editor" | "page" = "editor") {
  const width = previewFrameWidth(viewport, context);
  if (viewport === "desktop") return width;
  return `${width} overflow-hidden rounded-[24px] border border-stone bg-ivory shadow-[0_20px_60px_rgba(17,17,17,0.08)]`;
}

export function previewTitleClasses(viewport: PreviewViewport, extra = "") {
  const base = `font-serif text-ink text-balance ${extra}`.trim();
  if (viewport === "mobile") return `${base} text-[1.75rem] leading-[1.1]`;
  if (viewport === "tablet") return `${base} text-4xl leading-[1.02]`;
  return `${base} text-5xl leading-[0.96] sm:text-7xl`;
}

export function previewSubtitleClasses(viewport: PreviewViewport, extra = "") {
  const base = extra.trim();
  if (viewport === "mobile") return `${base} text-base leading-7`.trim();
  if (viewport === "tablet") return `${base} text-lg leading-7`.trim();
  return `${base} text-xl leading-8`.trim();
}
