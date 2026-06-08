import { API_URL } from "@/routes/apiRoute";

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
};

async function apiFetch<T>(path: string, options: ApiOptions = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getInstallations(token?: string | null) {
  return apiFetch<{ success: boolean; installations: Installation[] }>("/installations", { token });
}

export async function getInstallationRepos(installationId: string, token?: string | null) {
  return apiFetch<{ success: boolean; repos: Repo[] }>(`/installations/${installationId}/repos`, { token });
}

export async function getRepos(token?: string | null) {
  return apiFetch<{ success: boolean; repos: Repo[] }>("/repos", { token });
}

export async function getReviews(token?: string | null) {
  return apiFetch<{ success: boolean; reviews: Review[] }>("/dashboard/reviews", { token });
}
