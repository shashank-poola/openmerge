import { ME_URL } from "@/routes/apiRoute";

export type GithubUser = {
  id: string;
  githubLogin: string;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
};

export async function getMe(token: string): Promise<{ success: boolean; user: GithubUser }> {
  const res = await fetch(ME_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`getMe failed: ${res.status}`);
  return res.json();
}
