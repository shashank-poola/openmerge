import Link from "next/link";

export function AnnouncementBar() {
  return (
    <div className="flex h-11 items-center justify-center bg-pr-charcoal px-4 font-mono text-[15px] text-white">
      <Link href="#" className="transition-opacity hover:opacity-75">
        Introducing PullRabbit Cloud -&gt;
      </Link>
    </div>
  );
}
