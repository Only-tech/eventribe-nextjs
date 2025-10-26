// 'use server';

import { pool } from '@/app/lib/data-access/db';
import { User } from '@/app/lib/definitions';
import nodemailer from 'nodemailer';
import { VerificationCodeEmail } from '@/app/lib/email-templates/VerificationCodeEmail';

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
        console.log(`E-mail envoyé à ${to}`);
    } catch (error) {
        console.error(`Erreur d'envoi à ${to}:`, error);
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

        const existingUser = await client.query<User>(
            `SELECT id FROM users WHERE email = $1`,
            [email]
        );
        if (existingUser.rows.length > 0) {
            console.error("Email déjà utilisé.");
            return false;
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000);

        await client.query(
            `INSERT INTO email_verifications (email, verification_code, expires_at)
            VALUES ($1, $2, $3)
            ON CONFLICT (email) DO UPDATE SET verification_code = $2, expires_at = $3`,
            [email, code, expiry]
        );

        const html = VerificationCodeEmail(code, email);
        await sendNotificationEmail(email, "Votre code de vérification eventribe", html);
        return true;
    } catch (error) {
        console.error("Erreur lors de l'envoi du code :", error);
        return false;
    } finally {
        if (client) client.release();
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