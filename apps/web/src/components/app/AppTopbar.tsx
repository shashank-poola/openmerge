"use client";

import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { PullRabbitLogo } from "@/components/brand/PullRabbitLogo";
import { demoUser } from "@/src/lib/demo-data";

type AppTopbarProps = {
  showBack?: boolean;
};

export function AppTopbar({ showBack = false }: AppTopbarProps) {
  const { data: session } = useSession();
  const login = session?.user?.name ?? demoUser.login;

  return (
    <header className="absolute left-0 top-0 z-10 flex h-24 w-full items-center justify-center px-10 text-white">
      {showBack ? (
        <Link href="/setup/organizations" className="absolute left-11 inline-flex items-center gap-2 text-[16px] font-bold text-white/85 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      ) : null}
      <Link href="/" aria-label="PullRabbit home">
        <PullRabbitLogo className="text-white" markClassName="border-white/30" />
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="absolute right-11 inline-flex items-center gap-2 text-[16px] font-bold text-white/85 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        Log out {login}
      </button>
    </header>
  );
}
