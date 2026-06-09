import type { ISODateString } from "next-auth";

export interface UserType {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  provider?: string | null;
  token?: string | null;
  githubLogin?: string | null;
}

export interface CustomSession {
  user?: UserType;
  expires: ISODateString;
}

export type GitHubProfile = {
  login?: string;
  avatar_url?: string;
  id?: number | string;
  name?: string | null;
  email?: string | null;
};
