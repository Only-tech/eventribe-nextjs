import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/app/lib/data-access/users';
import { verifyResetCode, resetUserPassword, consumeResetCodes } from '@/app/lib/data-access/passwordResets';

export async function POST(request: Request) {
    try {
        const { email, code, newPassword } = await request.json();
        if (!email || !code || !newPassword) {
        return NextResponse.json({ message: 'Champs manquants.' }, { status: 400 });
        }

        const user = await getUserByEmail(email);
        if (!user) return NextResponse.json({ message: 'Email introuvable.' }, { status: 404 });
        
        // Verify the code
        const valid = await verifyResetCode(user.id, code);
        if (!valid) return NextResponse.json({ message: 'Code invalide ou expiré.' }, { status: 401 });
        
        // Update password
        const ok = await resetUserPassword(user.id, newPassword);
        if (!ok) return NextResponse.json({ message: 'Erreur mise à jour mot de passe.' }, { status: 500 });
        
        // Delete the code
        await consumeResetCodes(user.id);

        return NextResponse.json({ success: true, message: 'Mot de passe réinitialisé.' }, { status: 200 });
    } catch (err) {
        console.error('Erreur reset-password:', err);
        return NextResponse.json({ message: 'Erreur serveur.' }, { status: 500 });
    }
}