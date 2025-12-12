import CredentialsProvider from 'next-auth/providers/credentials';
import { AuthOptions } from 'next-auth';
import { loginUser } from '@/app/lib/data-access/users';

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                const user = await loginUser(credentials.email, credentials.password);
                if (user) {
                return {
                    id: user.id.toString(),
                    name: `${user.first_name} ${user.last_name}`,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    isAdmin: user.is_admin,
                };
                }
                return null;
            },
        }),
    ],
    session: { strategy: 'jwt' },
    jwt: { secret: process.env.NEXTAUTH_SECRET },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Session update if trigger update is called
            if (trigger === "update" && session?.image) {
                token.picture = session.image;
            }
            if (trigger === "update" && session) {
                return { ...token, ...session };
            }
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.firstName = user.firstName;
                token.lastName = user.lastName;
                token.email = user.email;
                token.isAdmin = user.isAdmin;
                token.picture = user.image_url;
            }
            return token;
        },
        async session({ session, token }) {
        if (token) {
            session.user.id = token.id;
            session.user.name = token.name;
            session.user.firstName = token.firstName;
            session.user.lastName = token.lastName;
            session.user.email = token.email;
            session.user.isAdmin = token.isAdmin as boolean;
            session.user.image = token.picture;
        }
        return session;
        },
    },
    pages: {
        signIn: '/login',
    },
};