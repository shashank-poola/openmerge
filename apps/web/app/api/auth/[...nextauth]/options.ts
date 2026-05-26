import { Account, AuthOptions, ISODateString } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { JWT } from 'next-auth/jwt';

export interface UserType {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    provider?: string | null;
    token?: string | null;
}

export interface CustomSession {
    user?: UserType;
    expires: ISODateString;
}

export const authOption: AuthOptions = {
    pages: {
        signIn: '/',
    },
    callbacks: {
        async signIn({
            user,
            account,
        }: {
            user: UserType;
            account: Account | null;
        }) {
            try {
                if (account?.provider === 'github') {
                    user.provider = 'github';
                    return true;
                }
                return false;
            } catch (err) {
                console.error(err);
                return false;
            }
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
            clientId: process.env.GITHUB_CLIENT_ID || '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        }),
    ],
};
