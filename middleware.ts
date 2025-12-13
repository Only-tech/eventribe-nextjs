import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    // Execute if "authorized" send true
    function middleware(req) {
        const token = req.nextauth.token;
        const { pathname } = req.nextUrl;

        // If user is authenticated, avoid to access /login
        if (token && pathname.startsWith('/login')) {
            const isAdmin = token.isAdmin;
            const target = isAdmin ? "/admin" : "/events";
            return NextResponse.redirect(new URL(target, req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ req, token }) => {
                const { pathname } = req.nextUrl;

                // Allow authenticated users
                if (token) return true;

                if (
                    pathname === "/" ||
                    pathname.startsWith("/login") ||
                    pathname.startsWith("/register") ||
                    pathname.startsWith("/password") ||
                    pathname.startsWith("/api/auth") ||
                    pathname.startsWith("/_next") ||
                    pathname.startsWith("/profiles") ||
                    pathname.startsWith("/public")
                ) {
                    return true;
                }

                // Block if not
                return false;
            },
        },
        // For the token JWT server side
        secret: process.env.NEXTAUTH_SECRET, 
    }
);

export const config = {
    // The matcher excludes static files
    matcher: ['/((?!_next/static|_next/image|favicon.ico|profiles).*)'],
};