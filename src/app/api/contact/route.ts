import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    const { name, email, message } = await req.json();

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.EMAIL_USER) {
        console.error("Missing SMTP environment variables");
        return NextResponse.json({ error: "La configuration du serveur est incomplète." }, { status: 500 });
    }

    if (!name || !email || !message) {
        return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,                // "smtp.gmail.com"
        port: Number(process.env.SMTP_PORT) || 587, // 465 si secure
        secure: process.env.SMTP_SECURE === "true", // true -> port 465
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,              // App Password pour Gmail
        },
    });

    // e-mail
    const mailOptions = {
        from: `"eventribe Contact" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,  
        replyTo: email,                
        subject: `Nouveau message de ${name}`,
        html: `
            <div style="font-family: Inter, sans-serif; max-width: 960px; margin: auto;">
                <div style="text-align: center; background-color: #f8f8ec; color: #222; padding:14px 24px 10px 24px; border-radius: 12px; border: 1px solid #ddd;">
                    <img src="https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/SplashPaintEventribeLogo.svg" alt="Eventribe" style="height: 60px; margin-bottom: 10px;" />
                    <h4 style="margin: 0 0 20px; padding-bottom: 20px; border-bottom: 1px solid #ddd;">${name}</h4>
                    <p style="margin: 0 0 16px;">${email}</p>
                </div>
                <div style="color: #666; margin-top: 24px; background-color: #f8f8ec; color: #222; padding: 10px 24px 5px 24px; border-radius: 12px; border: 1px solid #ddd;">
                    <p>${message.replace(/\n/g, '<br>')}</p>
                    <p style="margin-top: 14px; color: #ff952a; text-align: right;">${name}</p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return NextResponse.json({ message: 'Votre message a été envoyé avec succès !' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Échec de l'envoi du message. Veuillez réessayer." }, { status: 500 });
    }
}