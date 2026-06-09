"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GITHUB_EXCHANGE_URL } from "@/routes/apiRoute";

const GITHUB_INSTALL_URL =
  "https://github.com/apps/pull-rabbit/installations/select_target";

export function GithubCallbackPage() {
  const searchParams = useSearchParams();
  const called = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = searchParams.get("code");
    if (!code) {
      setError("No code received from GitHub.");
      return;
    }

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
  }, [searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#131010] font-mono">
        <div className="space-y-4 text-center">
          <p className="text-[13px] text-red-400">{error}</p>
          <a
            href="/"
            className="inline-block text-[12px] text-[#444] transition-colors hover:text-white"
          >
            ← return home
          </a>
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
