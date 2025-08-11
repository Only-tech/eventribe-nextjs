import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { loginUser } from '@/app/lib/auth';
import { AuthOptions, DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

// Extension for the NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      isAdmin: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
  }
}

// NextAuth Configuration 
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await loginUser(credentials.email, credentials.password);

        if (user) {
          return {
            id: user.id.toString(),
            name: user.username,
            email: user.email,
            isAdmin: user.is_admin,
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
