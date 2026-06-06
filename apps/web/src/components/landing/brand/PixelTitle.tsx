const glyphs: Record<string, string[]> = {
  a: ["1110", "0001", "1111", "1001", "1111"],
  b: ["1000", "1110", "1001", "1001", "1110"],
  i: ["1", "0", "1", "1", "1"],
  l: ["1", "1", "1", "1", "1"],
  p: ["1110", "1001", "1110", "1000", "1000"],
  r: ["1110", "1001", "1110", "1010", "1001"],
  t: ["111", "010", "010", "010", "010"],
  u: ["1001", "1001", "1001", "1001", "1111"],
};

type PixelTitleProps = {
  text: string;
};

export function PixelTitle({ text }: PixelTitleProps) {
  return (
    <div className="flex max-w-full flex-wrap items-start gap-x-3 gap-y-2" aria-label={text}>
      {text.split("").map((letter, index) => (
        <PixelGlyph key={`${letter}-${index}`} letter={letter.toLowerCase()} />
      ))}
    </div>
  );
}

function PixelGlyph({ letter }: { letter: string }) {
  const rows = glyphs[letter] ?? glyphs.r;

  return (
    <span className="grid gap-[6px]" aria-hidden="true">
      {rows.map((row, rowIndex) => (
        <span key={`${letter}-${rowIndex}`} className="flex gap-[6px]">
          {row.split("").map((cell, columnIndex) => (
            <span
              key={`${letter}-${rowIndex}-${columnIndex}`}
              className={`block h-[13px] w-[18px] ${
                cell === "1" ? "bg-pr-charcoal" : "bg-transparent"
              }`}
            />
          ))}
        </span>
      ))}
    </span>
  );
}
