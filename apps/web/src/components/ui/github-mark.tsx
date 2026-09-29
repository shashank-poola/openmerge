import Image from "next/image";
import { cn } from "@/lib/utils";

/** The GitHub mark from /public/github.png, used wherever we reference GitHub. */
export function GithubMark({ size = 16, className }: { size?: number; className?: string }) {
  return <Image src="/github.png" alt="" width={size} height={size} aria-hidden="true" className={cn("shrink-0 select-none", className)} />;
}
