import { DefaultSession } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

// 'next-auth' to extend the types
declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      isAdmin: boolean; 
    } & DefaultSession['user'];
  }

  /**
   * The shape of the user object returned in the JWT.
   */
  interface User {
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

export type Event = {
  id: string;
  title: string;
  description_short: string;
  description_long: string;
  event_date: string;
  location: string;
  available_seats: number;
  image_url: string | null;
  registered_count: number;
};

export type User = {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  is_admin: boolean;
  created_at: string;
};

export type Registration = {
  id: string;
  user_id: string;
  event_id: string;
  registered_at: string;
};

export type Participant = {
  user_id: number;
  username: string;
  email: string;
  registered_at: string;
};
