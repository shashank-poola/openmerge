import {
  DASHBOARD_URL,
  INSTALLATIONS_CALLBACK_URL,
  INSTALLATIONS_URL,
  ME_URL,
  REPOS_URL,
  AUTH_URL,
} from "@/routes/apiRoute";
import type { GithubUser } from "@/types/api";
import type {
  DashboardResponse,
  RepoUpdateResponse,
  ReviewDetailResponse,
  ReviewsResponse,
  SyncInstallationResponse,
} from "@/types/dashboard";

export type { GithubUser };

export const GITHUB_SIGN_IN_URL = `${AUTH_URL}/github`;

const SESSION_EXPIRED = "SESSION_EXPIRED";
const AUTH_ERRORS = new Set([SESSION_EXPIRED, "UNAUTHORIZED", "INVALID_TOKEN", "TOKEN_REQUIRED", "USER_NOT_FOUND"]);

/** True when the API rejected the session (missing, expired, or invalid JWT). */
export function isAuthError(error: string | null | undefined) {
  return Boolean(error && AUTH_ERRORS.has(error));
}

export async function getMe(token: string): Promise<{ success: boolean; user: GithubUser }> {
  const res = await fetch(ME_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`getMe failed: ${res.status}`);
  return res.json();
}

export async function installationCallback(
  token: string,
  installationId: string
): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(INSTALLATIONS_CALLBACK_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ installationId }),
  });
  return res.json();
}

async function getAuthToken() {
  const token = window.localStorage.getItem("pr_token");

  if (!token) {
    throw new Error(SESSION_EXPIRED);
  }

  return token;
}

async function authenticatedFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const token = await getAuthToken();
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;

  if (!response.ok) {
    const error = payload && typeof payload === "object" && "error" in payload ? payload.error : null;
    throw new Error(error ?? `Request failed: ${response.status}`);
  }

  return payload as T;
}

export function getDashboard() {
  return authenticatedFetch<DashboardResponse>(DASHBOARD_URL);
}

export function getReviews(page = 1) {
  return authenticatedFetch<ReviewsResponse>(`${DASHBOARD_URL}/reviews?page=${page}`);
}

export function getReview(reviewId: string) {
  return authenticatedFetch<ReviewDetailResponse>(`${DASHBOARD_URL}/reviews/${reviewId}`);
}

export function setRepositoryAutoReview(repoId: string, autoReviewEnabled: boolean) {
  return authenticatedFetch<RepoUpdateResponse>(`${REPOS_URL}/${repoId}/auto-review`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ autoReviewEnabled }),
  });
}

export function syncInstallation(installationId: string) {
  return authenticatedFetch<SyncInstallationResponse>(
    `${INSTALLATIONS_URL}/${installationId}/sync`,
    { method: "POST" }
  );
}
