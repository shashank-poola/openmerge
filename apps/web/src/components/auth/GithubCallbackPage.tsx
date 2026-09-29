"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GITHUB_EXCHANGE_URL } from "@/routes/apiRoute";
import { GITHUB_INSTALL_URL } from "@/lib/dashboard";
import { ConnectScreen, connectButtonStyles } from "./ConnectScreen";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const PENDING_INSTALLATION_ID_KEY = "openmerge_pending_installation_id";

const steps = ["Verifying GitHub authorization", "Creating your secure session", "Routing you to setup"];

export function GithubCallbackPage() {
  const searchParams = useSearchParams();
  const called = useRef(false);
  const [error, setError] = useState("");
  const code = searchParams.get("code");

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
          const pendingInstallationId = sessionStorage.getItem(PENDING_INSTALLATION_ID_KEY);
          if (pendingInstallationId) {
            sessionStorage.removeItem(PENDING_INSTALLATION_ID_KEY);
            window.location.href = `/setup?installation_id=${encodeURIComponent(pendingInstallationId)}`;
            return;
          }

          const isLocalDevelopment = ["localhost", "127.0.0.1"].includes(window.location.hostname);
          window.location.href = isLocalDevelopment ? "/dashboard" : GITHUB_INSTALL_URL;
        } else {
          setError(data.error ?? "Authentication failed.");
        }
      })
      .catch(() => setError("Could not reach the OpenMerge server."));
  }, [code]);

  const message = error || (code ? "" : "GitHub did not return an authorization code.");

  if (message) {
    return (
      <ConnectScreen
        state="error"
        eyebrow="Step 1 of 2 · Sign in"
        title="Sign-in needs attention."
        description={message}
        actions={
          <>
            <a href={`${API_BASE}/api/v1/auth/github`} className={connectButtonStyles.primary}>
              Sign in with GitHub again
            </a>
            <Link href="/" className={connectButtonStyles.secondary}>
              Back home
            </Link>
          </>
        }
      />
    );
  }

  return (
    <ConnectScreen
      state="working"
      eyebrow="Step 1 of 2 · Sign in"
      title="Connecting your GitHub"
      description="One moment while OpenMerge securely completes the handoff."
      steps={steps}
    />
  );
}
