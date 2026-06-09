import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#131010] font-mono text-white">
      <div className="space-y-6 text-center">
        <pre className="hidden whitespace-pre text-[#555] sm:block">
          {`
       _             _            _
   _  /\\ \\         / /\\       _  /\\ \\
  /\\_\\\\ \\ \\       / /  \\     /\\_\\\\ \\ \\
 / / / \\ \\ \\     / / /\\ \\   / / / \\ \\ \\
/ / /   \\ \\ \\   / / /\\ \\ \\ / / /   \\ \\ \\
\\ \\ \\____\\ \\ \\ /_/ /  \\ \\ \\\\ \\ \\____\\ \\ \\
 \\ \\________\\ \\\\ \\ \\   \\ \\ \\\\ \\________\\ \\
  \\/________/\\ \\\\ \\ \\   \\ \\ \\/________/\\ \\
            \\ \\ \\\\ \\ \\___\\ \\ \\         \\ \\ \\
             \\ \\_\\\\ \\/____\\ \\ \\         \\ \\_\\
              \\/_/ \\_________\\/          \\/_/
          `}
        </pre>
        <p className="text-6xl font-bold text-[#333] sm:hidden">404</p>
        <p className="text-[13px] text-[#555]">
          looks like you&apos;ve wandered into uncharted territory
        </p>
        <Link
          href="/"
          className="inline-block text-[12px] text-[#444] transition-colors hover:text-white"
        >
          ← return home
        </Link>
      </div>
    </div>
  );
}
