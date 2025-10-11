import { compare, hash } from 'bcrypt';
import { pool } from '@/app/lib/data'; 
import { User } from './definitions'; 
import CredentialsProvider from 'next-auth/providers/credentials';
import { AuthOptions } from 'next-auth';
import nodemailer from 'nodemailer';


export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,                // "smtp.gmail.com"
  port: Number(process.env.SMTP_PORT) || 587, // 465 si secure
  secure: process.env.SMTP_SECURE === "true", // true -> port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,              // App Password pour Gmail
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


/**
 * Creates user and delete verification code.
 * @param email 
 * @param firstName 
 * @param lastName 
 * @param password_plain 
 * @returns Successful, false otherwise.
 */
export async function finalRegisterUser(
    email: string, 
    firstName: string, 
    lastName: string, 
    password_plain: string
): Promise<boolean> {
    let client;
    try {
        client = await pool.connect();
        
        // Check if email is verified in email_verifications
        const verificationCheck = await client.query(
            `SELECT email FROM email_verifications WHERE email = $1`,
            [email]
        );
        if (verificationCheck.rows.length === 0) {
            console.error("L'email n'a pas été vérifié ou la session a expiré.");
            return false;
        }

        const existingUser = await client.query<User>(
            `SELECT id FROM users WHERE email = $1`,
            [email]
        );
        if (existingUser.rows.length > 0) {
            console.error("L'email existe déjà dans la table des utilisateurs.");
            return false;
        }

        const password_hash = await hash(password_plain, 10);


        // Start Query
        await client.query('BEGIN');

        await client.query(
            `INSERT INTO users (email, password_hash, is_admin, created_at, first_name, last_name)
             VALUES ($1, $2, FALSE, NOW(), $3, $4)`,
            [email, password_hash, firstName, lastName]
        );
        
        // Delete verification (email verified = registration is finished)
        await client.query(`DELETE FROM email_verifications WHERE email = $1`, [email]);

        // Validate query
        await client.query('COMMIT');
        
        console.log("Inscription finale réussie !");
        return true;
        
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK'); // rollback if error
        }
        console.error("Erreur lors de l'inscription finale :", error);
        return false;
    } finally {
        if (client) {
            client.release();
        }
    }
}

/**
 * Logs in a user.
 * @param email 
 * @param password_plain 
 * @returns Successful, null otherwise.
 */
export async function loginUser(email: string, password_plain: string): Promise<User | null> {
  let client; 
  try {
    client = await pool.connect(); 

    // Retrieves the user by email
    const result = await client.query<User>( 
      `SELECT id, email, password_hash, is_admin, created_at, first_name, last_name FROM users WHERE email = $1`,
      [email]
    );
    const user = result.rows[0];

    // If user not found or password doesn't match
    if (!user || !(await compare(password_plain, user.password_hash))) {
      console.error("Email ou mot de passe incorrect.");
      return null;
    }

    console.log("Connexion réussie. Bienvenue, " + user.first_name + "!");
    return user;
  } catch (error) {
    console.error("Erreur de connexion :", error);
    return null;
  } finally {
    if (client) {
      client.release(); 
    }
  }
}

/**
 * Retrieves a user by their ID.
 * @param userId
 * @returns found, null otherwise.
 */
export async function getUserById(userId: number): Promise<User | null> {
  let client;
  try {
    client = await pool.connect(); 
    const result = await client.query<User>( 
      `SELECT id, email, password_hash, is_admin, created_at, first_name, last_name FROM users WHERE id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur par ID :", error);
    return null;
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * Retrieves all users.
 * @returns An array of users.
 */
export async function getAllUsers(): Promise<User[]> {
  let client; 
  try {
    client = await pool.connect(); 
    const result = await client.query<User>( 
      `SELECT id, email, password_hash, is_admin, created_at, first_name, last_name FROM users ORDER BY created_at DESC`
    );
    return result.rows;
  } catch (error) {
    console.error("Erreur lors de la récupération de tous les utilisateurs :", error);
    return [];
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * Deletes a user by their ID.
 * @param userId
 * @returns Successful, false otherwise.
 */
export async function deleteUser(userId: number, currentUserId: number): Promise<boolean> {
  // Prevent admin from deleting their own account
  if (userId === currentUserId) {
    console.warn("Tentative de suppression du compte par l'utilisateur lui-même bloquée.");
    return false;
  }

  let client; 
  try {
    client = await pool.connect();
    await client.query(`DELETE FROM users WHERE id = $1`, [userId]);
    console.log("Utilisateur supprimé avec succès !");
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur :", error);
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
}


/**
 * Updates a user's information.
 * @param id The user ID.
 * @param data The new user data.
 * @returns True if the update is successful, false otherwise.
 */
export async function updateUser(id: string, data: { email: string; firstName: string; lastName: string }): Promise<boolean> {
  let client;
  try {
    client = await pool.connect();
    await client.query(
      `UPDATE users
       SET
         first_name = $1,
         last_name = $2,
         email = $3
       WHERE id = $4`,
      [data.firstName, data.lastName, data.email, id]
    );
    console.log("Informations de l'utilisateur mises à jour avec succès !");
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour des informations de l'utilisateur:", error);
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
}


/**
 * Updates a user's admin status.
 * @param userId 
 * @param isAdmin The new admin status.
 * @returns Successful, false otherwise.
 */

export async function updateUserAdminStatus( userId: number, isAdmin: boolean, currentUserId?: number ): Promise<boolean> {
  // Prevent admin from changing their own status
  if (userId === currentUserId && isAdmin === false) {
    console.warn("Tentative bloquée : un administrateur ne peut pas retirer son propre statut.");
    return false;
  }

  let client;
  try {
    client = await pool.connect();
    await client.query(`UPDATE users SET is_admin = $1 WHERE id = $2`, [isAdmin, userId]);
    console.log("Statut administrateur mis à jour avec succès !");
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut administrateur :", error);
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * Counts the total number of users.
 * @returns The total number of users.
 */
export async function countUsers(): Promise<number> {
  let client; 
  try {
    client = await pool.connect();
    const result = await client.query(`SELECT COUNT(*) FROM users`);
    return Number(result.rows[0].count);
  } catch (error) {
    console.error("Erreur lors du comptage des utilisateurs :", error);
    return 0;
  } finally {
    if (client) {
      client.release();
    }
  }
}


export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await loginUser(credentials.email, credentials.password);
        if (user) {
          return {
            id: user.id.toString(),
            name: `${user.first_name} ${user.last_name}`,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            isAdmin: user.is_admin,
          };
        }
        return null;
      },
    }),
  ],
  session: { strategy: 'jwt' },
  jwt: { secret: process.env.NEXTAUTH_SECRET },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.email = user.email;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.email = token.email;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
