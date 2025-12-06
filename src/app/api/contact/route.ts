import { NextResponse } from 'next/server';
import { transporter } from '@/app/lib/services/email'; 
import { ContactEmail } from '@/app/lib/email-templates/ContactEmail';

export async function POST(req: Request) {
    const { name, email, message } = await req.json();

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.EMAIL_USER) {
        console.error("Missing SMTP environment variables");
        return NextResponse.json({ error: "La configuration du serveur est incomplète." }, { status: 500 });
    }

    if (!name || !email || !message) {
        return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 });
    }

    // e-mail
    const emailHtml = ContactEmail(name, email, message);
    const mailOptions = {
        from: `"eventribe Contact" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,  
        replyTo: email,                
        subject: `Nouveau message de ${name}`,
        html: emailHtml,
    };

    try {
        await transporter.sendMail(mailOptions);
        return NextResponse.json({ message: 'Votre message a été envoyé avec succès !' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Échec de l'envoi du message. Veuillez réessayer." }, { status: 500 });
    }
}