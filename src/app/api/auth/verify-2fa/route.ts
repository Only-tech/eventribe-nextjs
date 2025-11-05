import { NextResponse } from 'next/server';
import { verifyTwoFactorCode, getUserById } from '@/app/lib/data-access/users';

export async function POST(request: Request) {

    try {
        const { userId, code } = await request.json();
        if (!userId || !code) {
            return NextResponse.json({ message: 'Champs manquants.' }, { status: 400 });
        }

        const valid = await verifyTwoFactorCode(userId, code);
        if (!valid) {
            return NextResponse.json({ message: 'Code invalide ou expiré.' }, { status: 401 });
        }

        const user = await getUserById(userId);
        if (!user) {
            return NextResponse.json({ message: 'Utilisateur introuvable.' }, { status: 404 });
        }

        // Send back user infos whithout password_hash
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const { password_hash: _password_hash, ...userWithoutHash } = user;
        return NextResponse.json({ success: true, user: userWithoutHash }, { status: 200 });
    } catch (error) {
        console.error('Erreur verify-2fa:', error);
        return NextResponse.json({ message: 'Erreur interne.' }, { status: 500 });
    }
}
