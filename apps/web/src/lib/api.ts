import {
  API_URL,
  INSTALLATIONS_URL,
  INSTALLATION_CALLBACK_URL,
  REPOS_URL,
  DASHBOARD_REVIEWS_URL,
  installationReposUrl,
  installationSyncUrl,
  repoAutoReviewUrl,
  dashboardReviewUrl,
} from "@/routes/apiRoute";

export type Installation = {
  id: string;
  accountLogin: string;
  accountAvatarUrl?: string | null;
  accountType?: string | null;
};

export type Repo = {
  id: string;
  name: string;
  fullName: string;
  owner?: string;
  autoReviewEnabled?: boolean;
};

export type Review = {
  id: string;
  prNumber: number;
  status: string;
  totalComments: number;
  createdAt: string;
  completedAt?: string | null;
  repository?: {
    id: string;
    fullName: string;
    owner: string;
    name: string;
  };
};

type ApiOptions = {
  token?: string | null;
  method?: string;
  body?: unknown;
};

async function apiFetch<T>(url: string, options: ApiOptions = {}): Promise<T> {
  const { token, method = "GET", body } = options;
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function getMe(token?: string | null) {
  return apiFetch<{ success: boolean; user: Record<string, unknown> }>(
    `${API_URL}/auth/me`,
    { token }
  );
}

// ── Installations ─────────────────────────────────────────────────────────────
export async function getInstallations(token?: string | null) {
  return apiFetch<{ success: boolean; installations: Installation[] }>(
    INSTALLATIONS_URL,
    { token }
  );
}

export async function getInstallationRepos(installationId: string, token?: string | null) {
  return apiFetch<{ success: boolean; repos: Repo[] }>(
    installationReposUrl(installationId),
    { token }
  );
}

export async function handleInstallationCallback(
  payload: { installationId: number; accountLogin: string; accountAvatarUrl?: string },
  token?: string | null
) {
  return apiFetch<{ success: boolean }>(INSTALLATION_CALLBACK_URL, {
    method: "POST",
    token,
    body: payload,
  });
}

export async function syncInstallationRepos(installationId: string, token?: string | null) {
  return apiFetch<{ success: boolean }>(installationSyncUrl(installationId), {
    method: "POST",
    token,
  });
}

// ── Repos ─────────────────────────────────────────────────────────────────────
export async function getRepos(token?: string | null) {
  return apiFetch<{ success: boolean; repos: Repo[] }>(REPOS_URL, { token });
}

export async function toggleRepoAutoReview(
  repoId: string,
  enabled: boolean,
  token?: string | null
) {
  return apiFetch<{ success: boolean }>(repoAutoReviewUrl(repoId), {
    method: "PATCH",
    token,
    body: { autoReviewEnabled: enabled },
  });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export async function getReviews(token?: string | null) {
  return apiFetch<{ success: boolean; reviews: Review[] }>(
    DASHBOARD_REVIEWS_URL,
    { token }
  );
}

export async function getReviewById(reviewId: string, token?: string | null) {
  return apiFetch<{ success: boolean; review: Review }>(
    dashboardReviewUrl(reviewId),
    { token }
  );
}
