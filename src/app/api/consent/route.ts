import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // "accept" or "reject"
    const { choice } = await request.json(); 

    const res = NextResponse.json({ success: true });

    res.cookies.set({
        name: 'cookie-consent',
        value: choice,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        // Keep one year
        maxAge: 60 * 60 * 24 * 365, 
    });

    return res;
}
