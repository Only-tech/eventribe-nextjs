'use server'; 

import { pool } from '@/app/lib/data-access/db';
import { User } from '@/app/lib/definitions';
import { compare, hash } from 'bcrypt';
import { sendNotificationEmail } from '@/app/lib/services/email';
import { WelcomeEmail } from '@/app/lib/email-templates/WelcomeEmail';

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


        // Start transaction
        await client.query('BEGIN');

        await client.query(
            `INSERT INTO users (email, password_hash, is_admin, created_at, first_name, last_name)
             VALUES ($1, $2, FALSE, NOW(), $3, $4)`,
            [email, password_hash, firstName, lastName]
        );
        
        // Delete verification (email verified = registration is finished)
        await client.query(`DELETE FROM email_verifications WHERE email = $1`, [email]);

        // Commit transaction
        await client.query('COMMIT');
        
        console.log("Inscription finale réussie !");

        // Send Notification Email 
        try {
            const html = WelcomeEmail(firstName, lastName);
            await sendNotificationEmail( email, "Bienvenue sur eventribe", html );
            console.log(`Mail de bienvenue envoyé à ${email}`);
        } catch (mailError) {
            console.error("Utilisateur créé mais échec de l'envoi du mail de bienvenue :", mailError);
        }

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


/**
 * Deletes a user's own account and all their registrations.
 * @param userId 
 * @returns True if deletion is successful, false otherwise.
 */
export async function deleteUserAccount(userId: number): Promise<boolean> {
    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');

        await client.query(`DELETE FROM registrations WHERE user_id = $1`, [userId]);
        
        // If i intend to delete or hide user's events too
        // await client.query(`DELETE FROM events WHERE created_by = $1`, [userId]);
        
        const deleteResult = await client.query(`DELETE FROM users WHERE id = $1`, [userId]);

        if (deleteResult.rowCount === 0) {
            throw new Error("L'utilisateur n'a pas été trouvé.");
        }

        await client.query('COMMIT');
        console.log("Utilisateur et inscriptions associées supprimés avec succès !");
        return true;
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
        }
        console.error("Erreur lors de la suppression du compte de l'utilisateur :", error);
        return false;
    } finally {
        if (client) {
            client.release();
        }
    }
}

/**
 * Verify if email is registed on users table.
 * @param email
 * @returns true if email exits, false otherwise
 */
export async function isEmailAlreadyRegistered(email: string): Promise<boolean> {
    let client;
    try {
        client = await pool.connect();
        const result = await client.query(
            `SELECT 1 FROM users WHERE email = $1 LIMIT 1`,
            [email]
        );
        return result.rows.length > 0;
    } catch (error) {
        console.error("Erreur lors de la vérification de l'email :", error);
        return false; 
    } finally {
        if (client) {
            client.release();
        }
    }
}
