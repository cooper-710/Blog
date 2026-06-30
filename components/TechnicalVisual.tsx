export function TechnicalVisual({ label = "Movement map" }: { label?: string }) {
  const dots = [
    [14, 70],
    [28, 54],
    [42, 38],
    [58, 34],
    [74, 45],
    [88, 28]
  ];

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-stone bg-paper p-5 shadow-soft">
      <div className="mb-6 flex items-center justify-between border-b border-stone pb-3">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">{label}</span>
        <span className="text-xs text-charcoal/60">TJG-LAB / V1</span>
      </div>
      <div className="relative aspect-[4/3] min-h-[260px]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(31,51,66,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(31,51,66,0.08)_1px,transparent_1px)] bg-[size:36px_36px]" />
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path
            d="M10 76 C28 48, 38 34, 55 37 C70 40, 78 50, 92 24"
            fill="none"
            stroke="#1F3342"
            strokeWidth="1.2"
          />
          <path
            d="M13 78 C30 70, 46 62, 68 48 C77 42, 84 35, 91 27"
            fill="none"
            stroke="#A55632"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          {dots.map(([cx, cy], index) => (
            <g key={`${cx}-${cy}`}>
              <circle cx={cx} cy={cy} r="4.4" fill="#F4EFE6" stroke="#1F3342" strokeWidth="1" />
              <circle cx={cx} cy={cy} r="1.5" fill={index % 2 === 0 ? "#4F7475" : "#A55632"} />
            </g>
          ))}
        </svg>
        <div className="absolute bottom-4 left-4 max-w-[220px] rounded-2xl border-l-2 border-clay bg-ivory/85 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-charcoal/60">Frame logic</p>
          <p className="mt-1 font-serif text-lg leading-tight text-ink">
            Timing, force, and movement context before cueing.
          </p>
        </div>
      </div>
    </div>
  );
}
