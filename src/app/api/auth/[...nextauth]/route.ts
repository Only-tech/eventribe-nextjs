import NextAuth from 'next-auth';
import { authOptions } from '@/app/lib/auth'; // ✅ OK si auth.ts n’est pas un fichier route

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };