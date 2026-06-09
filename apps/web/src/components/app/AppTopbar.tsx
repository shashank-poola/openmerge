"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Logout01Icon } from "@hugeicons/core-free-icons";
import { signOut, useSession } from "next-auth/react";
import { demoUser } from "@/src/lib/demo-data";

type AppTopbarProps = {
  showBack?: boolean;
};

export function AppTopbar({ showBack = false }: AppTopbarProps) {
  const { data: session } = useSession();
  const login = session?.user?.name ?? demoUser.login;

  return (
    <header className="absolute left-0 top-0 z-10 flex h-20 w-full items-center justify-center px-10 font-mono text-white">
      {showBack ? (
        <Link
          href="/setup/organizations"
          className="absolute left-10 inline-flex items-center gap-2 text-[13px] text-[#777] hover:text-white"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={15} strokeWidth={1.5} />
          Back
        </Link>
      ) : null}
      <Link href="/" className="text-[14px] font-bold text-white tracking-tight" aria-label="PullRabbit home">
        pullrabbit
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="absolute right-10 inline-flex items-center gap-2 text-[13px] text-[#777] hover:text-white"
      >
        <HugeiconsIcon icon={Logout01Icon} size={15} strokeWidth={1.5} />
        Log out {login}
      </button>
    </header>
  );
}
