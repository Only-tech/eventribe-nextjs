import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/app/lib/data-access/users';
import { verifyResetCode } from '@/app/lib/data-access/passwordResets';

export async function POST(request: Request) {
    try {
        const { email, code } = await request.json();
        if (!email || !code) return NextResponse.json({ message: 'Email et code requis.' }, { status: 400 });

        const user = await getUserByEmail(email);
        if (!user) return NextResponse.json({ message: 'Email introuvable.' }, { status: 404 });

        const valid = await verifyResetCode(user.id, code);
        if (!valid) return NextResponse.json({ message: 'Code invalide ou expiré.' }, { status: 401 });

        return NextResponse.json({ message: 'Code vérifié.' }, { status: 200 });
    } catch (err) {
        console.error('Erreur verify-reset-code:', err);
        return NextResponse.json({ message: 'Erreur serveur.' }, { status: 500 });
    }
}
