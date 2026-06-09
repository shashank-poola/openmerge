"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PageShell } from "@/components/layout/PageShell";
import { DotmSquare3 } from "@/components/ui/dotm-square-3";
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
    <PageShell>
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <DotmSquare3 className="mb-10" size={40} dotSize={5} speed={1.35} />
        <h1 className="max-w-[480px] text-[24px] font-bold leading-tight text-white">
          Hey {name}, welcome to PullRabbit!
        </h1>
        <p className="mt-4 text-[13px] text-[#555]">
          Give us a second to load your GitHub organizations...
        </p>
      </section>
    </PageShell>
  );
}
