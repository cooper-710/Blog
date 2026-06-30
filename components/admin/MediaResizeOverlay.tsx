"use client";

type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const HANDLES: { id: ResizeHandle; cursor: string; className: string }[] = [
  { id: "nw", cursor: "nwse-resize", className: "left-0 top-0 -translate-x-1/2 -translate-y-1/2" },
  { id: "n", cursor: "ns-resize", className: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" },
  { id: "ne", cursor: "nesw-resize", className: "right-0 top-0 translate-x-1/2 -translate-y-1/2" },
  { id: "e", cursor: "ew-resize", className: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2" },
  { id: "se", cursor: "nwse-resize", className: "right-0 bottom-0 translate-x-1/2 translate-y-1/2" },
  { id: "s", cursor: "ns-resize", className: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2" },
  { id: "sw", cursor: "nesw-resize", className: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2" },
  { id: "w", cursor: "ew-resize", className: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2" }
];

export type { ResizeHandle };

export function MediaResizeOverlay({
  frame,
  dropIndicator,
  onMovePointerDown,
  onResizePointerDown
}: {
  frame: DOMRect;
  dropIndicator: { x: number; y: number; width: number } | null;
  onMovePointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onResizePointerDown: (handle: ResizeHandle, event: React.PointerEvent<HTMLDivElement>) => void;
}) {
  return (
    <>
      {dropIndicator && (
        <div
          className="pointer-events-none fixed z-[54] h-0.5 rounded-full bg-teal shadow-[0_0_0_1px_rgba(244,239,230,0.85)]"
          style={{ left: dropIndicator.x, top: dropIndicator.y, width: dropIndicator.width }}
        />
      )}
      <div
        data-media-overlay=""
        className="pointer-events-none fixed z-[55]"
        style={{ left: frame.left, top: frame.top, width: frame.width, height: frame.height }}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[24px] border-2 border-teal shadow-[0_0_0_4px_rgba(79,116,117,0.12)]" />
        <div
          className="absolute inset-3 cursor-grab rounded-[18px] pointer-events-auto active:cursor-grabbing"
          onPointerDown={onMovePointerDown}
        />
        {HANDLES.map((handle) => (
          <div
            key={handle.id}
            className={`absolute h-3.5 w-3.5 rounded-full border-2 border-teal bg-ivory shadow-sm pointer-events-auto ${handle.className}`}
            style={{ cursor: handle.cursor }}
            onPointerDown={(event) => {
              event.stopPropagation();
              onResizePointerDown(handle.id, event);
            }}
          />
        ))}
      </div>
    </>
  );
}
