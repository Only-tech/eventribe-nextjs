// 'use server'; 

import nodemailer from 'nodemailer';
import { pool } from '@/app/lib/data-access/db';
import { User } from '@/app/lib/definitions';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,                // "smtp.gmail.com"
  port: Number(process.env.SMTP_PORT) || 587, // 465 if secure
  secure: process.env.SMTP_SECURE === "true", // true -> port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,              // App Password from Gmail
  },
});

/**
 * Notification e-mails.
 * @param to 
 * @param subject 
 * @param html 
 */
export async function sendNotificationEmail(to: string, subject: string, html: string): Promise<void> {
    try {
        await transporter.sendMail({
            from: `"eventribe" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log(`E-mail de notification envoyé à ${to}`);
    } catch (error) {
        console.error(`Erreur lors de l'envoi de l'e-mail de notification à ${to}:`, error);
    }
}

/**
 * Generate a OTP code and save it in DB before sending email.
 * @param email
 * @returns Successful, false otherwise.
 */
export async function generateAndSendCode(email: string): Promise<boolean> {
    let client;
    try {
        client = await pool.connect();
        
        // Check if the email is registered in users table
        const existingUser = await client.query<User>( 
            `SELECT id FROM users WHERE email = $1`,
            [email]
        );
        if (existingUser.rows.length > 0) {
            console.error("L'email est déjà utilisé pour un compte existant.");
            return false;
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // Expire in 10 minutes

        // Save code in email_verifications
        await client.query(
            `INSERT INTO email_verifications (email, verification_code, expires_at)
             VALUES ($1, $2, $3)
             ON CONFLICT (email) 
             DO UPDATE SET verification_code = $2, expires_at = $3`,
            [email, code, expiry]
        );
        
        await transporter.sendMail({
            from: `"eventribe" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Votre code de vérification eventribe",
            html: `
                <div style="font-family: Inter, sans-serif; max-width: 480px; margin: auto;">
                  <div style="text-align: center; background-color: #f8f8ec; color: #222; padding:14px 24px 10px 24px; border-radius: 12px; border: 1px solid #ddd;">
                    <img src="https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/SplashPaintEventribeLogo.svg" alt="Eventribe" style="height: 60px; margin-bottom: 10px;" />
                    <h2 style="margin: 0 0 20px; padding-bottom: 20px; border-bottom: 1px solid #ddd;">Code de vérification</h2>
                    <p style="margin: 0 0 16px;">Veuillez utiliser le code ci-dessous pour vérifier votre adresse e-mail.</p>
                    <p style="font-size: 28px; font-weight: bold; background-color: white; padding: 12px 24px; border: 1px solid #ddd; border-radius: 8px; display: inline-block;">${code}</p>
                    <p style="margin-top: 16px;">Ce code est valable pendant <strong>10 minutes</strong>.</p>
                  </div>
                  <div style="color: #666; margin-top: 24px; background-color: #f8f8ec; color: #222; padding: 10px 24px 5px 24px; border-radius: 12px; border: 1px solid #ddd;">
                    <p style="font-size: 13px;">Si vous n'avez pas demandé ce code, vous pouvez ignorer cet e-mail.</p>
                    <p style="font-size: 13px; margin-top: 14px; color: #ff952a; text-align: right;">eventribe.vercel.app</p>
                  </div>
                </div>
            `,
        });

        console.log(`Code de vérification envoyé et enregistré pour ${email}.`);
        return true;
    } catch (error) {
        console.error("Erreur lors de l'envoi/enregistrement du code:", error);
        return false;
    } finally {
        if (client) {
            client.release();
        }
    }
}

/**
 * Check the code validity for the email.
 * @param email 
 * @param code 
 * @returns True if the code is valid and unexpired.
 */
export async function verifyCode(email: string, code: string): Promise<boolean> {
    let client;
    try {
        client = await pool.connect();

        const result = await client.query(
            `SELECT verification_code, expires_at FROM email_verifications WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            console.error(`Aucun code trouvé pour l'email: ${email}`);
            return false;
        }

        const verificationData = result.rows[0];
        const now = new Date();
        
        if (verificationData.verification_code !== code) {
            console.error(`Code incorrect pour l'email: ${email}`);
            return false;
        }
        
        if (verificationData.expires_at < now) {
            console.error(`Code expiré pour l'email: ${email}`);
            await client.query(`DELETE FROM email_verifications WHERE email = $1`, [email]); // clean
            return false;
        }

        console.log(`Code vérifié avec succès pour l'email: ${email}`);
        return true;

    } catch (error) {
        console.error("Erreur lors de la vérification du code:", error);
        return false;
    } finally {
        if (client) {
            client.release();
        }
    }
}