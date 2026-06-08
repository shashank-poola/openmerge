"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { DarkGridShell } from "@/components/app/DarkGridShell";
import { DotMatrixLoader } from "@/components/common/DotMatrixLoader";
import { demoUser } from "@/src/lib/demo-data";

export function LoadingOrganizationsScreen() {
  const router = useRouter();
  const { data: session } = useSession();
  const name = session?.user?.name ?? demoUser.name;

  useEffect(() => {
    const timer = window.setTimeout(() => router.push("/setup/organizations"), 1600);
    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <DarkGridShell>
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <DotMatrixLoader className="mb-10" size="sm" />
        <h1 className="max-w-[520px] text-[31px] font-normal leading-tight">
          Hey {name}, welcome to PullRabbit!
        </h1>
        <p className="mt-4 text-[17px] font-bold text-white/25">
          Give us a second to load your GitHub organizations...
        </p>
      </section>
    </DarkGridShell>
  );
}
