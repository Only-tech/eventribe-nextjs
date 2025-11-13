import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Only act on /login (matcher below ensures this)
    if (pathname !== "/login") {
        return NextResponse.next();
    }

    // Read NextAuth JWT; requires NEXTAUTH_SECRET
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    // If authenticated, redirect away from /login
    if (token) {
        const isAdmin = (token as any)?.isAdmin;
        const target = isAdmin ? "/admin" : "/events";
        return NextResponse.redirect(new URL(target, req.url));
    }

    // Not authenticated → allow access to /login
    return NextResponse.next();
}

export const config = {
    matcher: ["/login"],
};
