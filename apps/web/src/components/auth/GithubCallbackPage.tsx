"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GITHUB_EXCHANGE_URL } from "@/routes/apiRoute";

const GITHUB_INSTALL_URL =
  "https://github.com/apps/pull-rabbit/installations/select_target";

export function GithubCallbackPage() {
  const searchParams = useSearchParams();
  const called = useRef(false);
  const [error, setError] = useState("");
  const code = searchParams.get("code");
  const missingCodeError = useMemo(
    () => (code ? "" : "No code received from GitHub."),
    [code]
  );

  useEffect(() => {
    if (!code || called.current) return;
    called.current = true;

    fetch(GITHUB_EXCHANGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((data: { success: boolean; token?: string; error?: string }) => {
        if (data.success && data.token) {
          localStorage.setItem("pr_token", data.token);
          window.location.href = GITHUB_INSTALL_URL;
        } else {
          setError(data.error ?? "Authentication failed.");
        }
      })
      .catch(() => setError("Could not reach server."));
  }, [code]);

  if (error || missingCodeError) {
    const message = error || missingCodeError;

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#131010] font-mono">
        <div className="space-y-4 text-center">
          <p className="text-[13px] text-red-400">{message}</p>
          <Link href="/" className="inline-block text-[12px] text-[#444] transition-colors hover:text-white">
            ← return home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#131010] font-mono">
      <div className="space-y-3 text-center">
        <p className="text-[13px] text-[#555]">Signing in…</p>
        <div className="mx-auto h-px w-12 animate-pulse bg-white/20" />
      </div>
    </div>
  );
}
