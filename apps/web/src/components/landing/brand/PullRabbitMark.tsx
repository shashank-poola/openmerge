export function PullRabbitMark() {
  return (
    <span className="grid w-[20px] grid-cols-3 gap-[4px]" aria-hidden="true">
      {Array.from({ length: 15 }).map((_, index) => {
        const visible = [0, 1, 2, 1, 3, 4, 7, 8, 10, 12, 13].includes(index);

        return (
          <span
            key={index}
            className={`h-[5px] w-[5px] ${visible ? "bg-pr-charcoal" : "bg-transparent"}`}
          />
        );
      })}
    </span>
  );
}
