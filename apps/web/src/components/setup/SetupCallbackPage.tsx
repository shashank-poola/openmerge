"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { INSTALLATIONS_CALLBACK_URL } from "@/routes/apiRoute";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type State = "loading" | "success" | "error" | "no_id";

export function SetupCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const called = useRef(false);
  const [state, setState] = useState<State>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const installationId = searchParams.get("installation_id");
  const hasInstallationId = useMemo(() => Boolean(installationId), [installationId]);

  useEffect(() => {
    if (!installationId) {
      return;
    }

    if (called.current) return;
    called.current = true;

    const token = localStorage.getItem("pr_token");
    if (!token) {
      window.location.href = `${API_BASE}/api/v1/auth/github`;
      return;
    }

    fetch(INSTALLATIONS_CALLBACK_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ installationId }),
    })
      .then((res) => res.json())
      .then((data: { success: boolean; error?: string }) => {
        if (data.success) {
          setState("success");
          setTimeout(() => router.push("/"), 2500);
        } else {
          setState("error");
          setErrorMsg(data.error ?? "Installation failed.");
        }
      })
      .catch(() => {
        setState("error");
        setErrorMsg("Could not reach server.");
      });
  }, [installationId, router]);

  const viewState = hasInstallationId ? state : "no_id";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#131010] font-mono">
      <div className="w-full max-w-sm space-y-6 px-6 text-center">
        {viewState === "loading" && (
          <>
            <p className="text-[13px] text-[#555]">Activating OpenMerge on your repos…</p>
            <div className="mx-auto h-px w-16 animate-pulse bg-white/20" />
          </>
        )}

        {viewState === "success" && (
          <>
            <p className="text-[13px] text-white">Bot activated.</p>
            <p className="text-[12px] text-[#555]">
              OpenMerge will now review every pull request automatically. Redirecting…
            </p>
          </>
        )}

        {viewState === "error" && (
          <>
            <p className="text-[13px] text-red-400">Activation failed.</p>
            <p className="text-[12px] text-[#555]">{errorMsg}</p>
            <Link href="/" className="inline-block text-[12px] text-[#444] transition-colors hover:text-white">
              ← return home
            </Link>
          </>
        )}

        {viewState === "no_id" && (
          <>
            <p className="text-[13px] text-[#555]">No installation ID found.</p>
            <Link href="/" className="inline-block text-[12px] text-[#444] transition-colors hover:text-white">
              ← return home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
