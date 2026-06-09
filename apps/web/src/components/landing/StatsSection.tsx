const starPoints = [
  [0, 180], [30, 178], [60, 174], [90, 167], [120, 155],
  [150, 138], [180, 115], [210, 88], [240, 60], [270, 35], [300, 18],
];

const barHeights = [12, 18, 22, 20, 28, 32, 27, 38, 42, 36, 48, 55, 50, 62, 68, 74, 80, 86, 82, 92, 96, 100];

function isDot(row: number, col: number): boolean {
  const v = (row * 31 + col * 17 + row * col * 3) % 100;
  const threshold = Math.round((row / 9) * 75 + 8);
  return v < threshold;
}

export function StatsSection() {
  const polylinePoints = starPoints.map(([x, y]) => `${x},${y}`).join(" ");
  const pathD =
    `M ${starPoints[0]![0]},180 ` +
    starPoints.map(([x, y]) => `L ${x},${y}`).join(" ") +
    ` L 300,180 Z`;

  return (
    <section className="border-t border-white/8 px-10 py-24">
      <h2 className="mb-4 text-[18px] font-bold text-white">
        The AI-powered GitHub PR reviewer.
      </h2>
      <p className="mb-16 max-w-[640px] text-[14px] leading-relaxed text-[#777]">
        [*] With over{" "}
        <strong className="text-white">2,100</strong> GitHub stars,{" "}
        <strong className="text-white">47</strong> contributors, and over{" "}
        <strong className="text-white">1,200</strong> commits, PullRabbit reviews
        pull requests for hundreds of teams every week.
      </p>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
        <div>
          <div className="h-[180px]">
            <svg
              width="100%"
              height="180"
              viewBox="0 0 300 180"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <pattern id="hatch" x="0" y="0" width="8" height="180" patternUnits="userSpaceOnUse">
                  <line x1="4" y1="0" x2="4" y2="180" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
                </pattern>
                <clipPath id="curveClip">
                  <path d={pathD} />
                </clipPath>
              </defs>
              <rect x="0" y="0" width="300" height="180" fill="url(#hatch)" clipPath="url(#curveClip)" />
              <polyline points={polylinePoints} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
            </svg>
          </div>
          <p className="mt-3 text-[12px] text-[#555]">
            Fig 1. <span className="font-bold text-white">2.1K</span> GitHub Stars
          </p>
        </div>

        <div>
          <div className="h-[180px] flex items-center">
            <div
              className="grid gap-[5px] w-full"
              style={{ gridTemplateColumns: "repeat(12, 1fr)" }}
              aria-hidden="true"
            >
              {Array.from({ length: 10 * 12 }).map((_, i) => {
                const row = Math.floor(i / 12);
                const col = i % 12;
                const visible = isDot(row, col);
                return (
                  <span
                    key={i}
                    className={`h-[10px] w-full rounded-[1px] ${visible ? "bg-white/25" : "bg-white/4"}`}
                  />
                );
              })}
            </div>
          </div>
          <p className="mt-3 text-[12px] text-[#555]">
            Fig 2. <span className="font-bold text-white">47K+</span> PRs Reviewed
          </p>
        </div>

        <div>
          <div className="h-[180px] flex items-end gap-[3px]" aria-hidden="true">
            {barHeights.map((h, i) => (
              <div key={i} className="flex-1 bg-white/20" style={{ height: `${h}%` }} />
            ))}
          </div>
          <p className="mt-3 text-[12px] text-[#555]">
            Fig 3. <span className="font-bold text-white">800+</span> Teams
          </p>
        </div>
      </div>
    </section>
  );
}
