export type GithubUser = {
  id: string;
  githubLogin: string;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type AuthSigninResponse = {
  success: boolean;
  token?: string;
};
