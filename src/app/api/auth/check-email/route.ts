import { NextResponse } from 'next/server';
import { isEmailAlreadyRegistered } from '@/app/lib/data-access/users'; 

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ message: "Email manquant" }, { status: 400 });
        }

        const exists = await isEmailAlreadyRegistered(email);

        return NextResponse.json({ exists }, { status: 200 });

    } catch (error) {
        console.error("Erreur check-email:", error);
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}