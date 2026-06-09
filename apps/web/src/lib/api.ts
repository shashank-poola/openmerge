import { ME_URL, INSTALLATIONS_CALLBACK_URL } from "@/routes/apiRoute";
import type { GithubUser } from "@/types/api";

export type { GithubUser };

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
