import type { Account, AuthOptions, ISODateString, Profile } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { JWT } from 'next-auth/jwt';
import { SIGNIN_URL } from '@/routes/apiRoute';

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

type GitHubProfile = Profile & {
    login?: string;
    avatar_url?: string;
    id?: number | string;
};

export const authOption: AuthOptions = {
    pages: {
        signIn: '/',
    },
    callbacks: {
        async signIn({
            user,
            account,
            profile,
        }: {
            user: UserType;
            account: Account | null;
            profile?: Profile;
        }) {
            if (account?.provider !== 'github') return false;

            const ghProfile = profile as GitHubProfile | undefined;

            user.provider = 'github';
            user.githubLogin = ghProfile?.login ?? user.name;

            try {
                const res = await fetch(SIGNIN_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user: {
                            githubUserId: account.providerAccountId,
                            githubLogin: ghProfile?.login ?? user.name,
                            email: user.email,
                            name: user.name,
                            avatarUrl: ghProfile?.avatar_url ?? user.image,
                        },
                    }),
                });

                if (res.ok) {
                    const data = await res.json() as { success: boolean; token?: string };
                    if (data.success && data.token) {
                        user.token = data.token;
                    }
                } else {
                    console.warn('[auth] backend signin non-ok:', res.status);
                }
            } catch (err) {
                console.warn('[auth] backend unreachable, proceeding without server JWT:', err);
            }

            return true;
        },

        async jwt({ token, user }) {
            if (user) {
                token.user = user as UserType;
            }
            return token;
        },

        async session({
            session,
            token,
        }: {
            session: CustomSession;
            token: JWT;
        }) {
            session.user = token.user as UserType;
            return session;
        },
    },
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID ?? '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
        }),
    ],
};
