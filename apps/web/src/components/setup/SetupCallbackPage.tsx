"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { INSTALLATIONS_CALLBACK_URL } from "@/routes/apiRoute";
import { ConnectScreen, connectButtonStyles } from "@/components/auth/ConnectScreen";
import { GITHUB_INSTALL_URL, pluralize } from "@/lib/dashboard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const PENDING_INSTALLATION_ID_KEY = "openmerge_pending_installation_id";
const REDIRECT_DELAY_MS = 1_800;

const steps = [
  "Verifying installation with GitHub",
  "Reading repository access",
  "Registering repositories",
  "Preparing your workspace",
];

type State = "loading" | "success" | "error";

export function SetupCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const called = useRef(false);
  const [state, setState] = useState<State>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [repoCount, setRepoCount] = useState<number | null>(null);

  const installationId = searchParams.get("installation_id");

  useEffect(() => {
    if (!installationId || called.current) return;
    called.current = true;

    const token = localStorage.getItem("pr_token");
    if (!token) {
      sessionStorage.setItem(PENDING_INSTALLATION_ID_KEY, installationId);
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
      .then((data: { success: boolean; repos?: unknown[]; error?: string }) => {
        if (data.success) {
          setRepoCount(Array.isArray(data.repos) ? data.repos.length : null);
          setState("success");
          setTimeout(() => router.push("/dashboard"), REDIRECT_DELAY_MS);
        } else {
          setState("error");
          setErrorMsg(data.error ?? "Installation failed.");
        }
      })
      .catch(() => {
        setState("error");
        setErrorMsg("Could not reach the OpenMerge server.");
      });
  }, [installationId, router]);

  if (!installationId) {
    return (
      <ConnectScreen
        state="error"
        eyebrow="GitHub App"
        title="Installation link incomplete."
        description="GitHub did not send an installation ID. Start the connection again from GitHub."
        actions={
          <>
            <a href={GITHUB_INSTALL_URL} className={connectButtonStyles.primary}>
              Install on GitHub
            </a>
            <Link href="/" className={connectButtonStyles.secondary}>
              Back home
            </Link>
          </>
        }
      />
    );
  }

  if (state === "error") {
    return (
      <ConnectScreen
        state="error"
        eyebrow="Step 2 of 2 · Activation"
        title="Activation needs attention."
        description={errorMsg}
        actions={
          <>
            <button type="button" onClick={() => window.location.reload()} className={connectButtonStyles.primary}>
              Try again
            </button>
            <a href={GITHUB_INSTALL_URL} className={connectButtonStyles.secondary}>
              Reinstall on GitHub
            </a>
          </>
        }
      />
    );
  }

  if (state === "success") {
    return (
      <ConnectScreen
        state="success"
        eyebrow="Step 2 of 2 · Activation"
        title="You're connected."
        description={
          repoCount !== null
            ? `${pluralize(repoCount, "repository", "repositories")} joined the review pipeline. Opening your workspace…`
            : "OpenMerge is ready to review pull requests. Opening your workspace…"
        }
        steps={steps}
      />
    );
  }

  return (
    <ConnectScreen
      state="working"
      eyebrow="Step 2 of 2 · Activation"
      title="Activating OpenMerge"
      description="Connecting the repositories you selected on GitHub to the review pipeline."
      steps={steps}
    />
  );
}
