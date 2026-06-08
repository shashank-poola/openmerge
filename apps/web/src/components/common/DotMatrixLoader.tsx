"use client";

const cells = [
  0, 0, 1, 0, 0,
  0, 1, 0, 1, 0,
  1, 0, 0, 0, 1,
  1, 0, 0, 0, 1,
  0, 1, 0, 1, 0,
];

type DotMatrixLoaderProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function DotMatrixLoader({ className = "", size = "md" }: DotMatrixLoaderProps) {
  const dot = size === "lg" ? "h-5 w-5" : size === "sm" ? "h-2.5 w-2.5" : "h-4 w-4";
  const gap = size === "lg" ? "gap-2.5" : "gap-2";

  return (
    <div className={`grid grid-cols-5 ${gap} ${className}`} aria-label="Loading">
      {cells.map((active, index) => (
        <span
          key={index}
          className={`${dot} rounded-full ${active ? "bg-white" : "bg-white/20"} dotm-pulse`}
          style={{ animationDelay: `${index * 55}ms` }}
        />
      ))}
    </div>
  );
}
