export function OpenMergeMark({ color = "dark" }: { color?: "dark" | "light" }) {
  const dotClass = color === "light" ? "bg-white" : "bg-pr-charcoal";
  return (
    <span className="grid w-[20px] grid-cols-3 gap-[4px]" aria-hidden="true">
      {Array.from({ length: 15 }).map((_, index) => {
        const visible = [0, 1, 2, 3, 4, 7, 8, 10, 12, 13].includes(index);
        return (
          <span
            key={index}
            className={`h-[5px] w-[5px] ${visible ? dotClass : "bg-transparent"}`}
          />
        );
      })}
    </span>
  );
}
