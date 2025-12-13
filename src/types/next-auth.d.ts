import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      isAdmin: boolean;
      image_url?: string | null
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isAdmin: boolean;
    image_url?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isAdmin: boolean;
    image?: string | null
  }
}
