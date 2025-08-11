import { compare, hash } from 'bcrypt';
import { pool } from '@/app/lib/data'; 
import { User } from './definitions'; // Assuming User type is defined in definitions.ts

/**
 * Registers a new user.
 * @param username
 * @param email 
 * @param password 
 * @returns Successful, false otherwise.
 */
export async function registerUser(username: string, email: string, password_plain: string): Promise<boolean> {
  let client; // Declare client outside try block
  try {
    client = await pool.connect(); // Get a client from the shared pool

    // Check if username or email already exists
    const existingUser = await client.query<User>( 
      `SELECT id FROM users WHERE username = $1 OR email = $2`,
      [username, email]
    );
    if (existingUser.rows.length > 0) {
      console.error("Le nom d'utilisateur ou l'email existe déjà.");
      return false;
    }

    // Hash the password before storing it
    const password_hash = await hash(password_plain, 10); // 10 is the salt rounds

    // Insert the new user into the database
    await client.query( 
      `INSERT INTO users (username, email, password_hash, is_admin, created_at)
       VALUES ($1, $2, $3, FALSE, NOW())`,
      [username, email, password_hash]
    );
    console.log("Inscription réussie !"); 
    return true;
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    return false;
  } finally {
    if (client) {
      client.release(); // Ensure client is released back to the pool
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
  let client; // Declare client outside try block
  try {
    client = await pool.connect(); // Get a client from the shared pool

    // Retrieve the user by email
    const result = await client.query<User>( 
      `SELECT id, username, password_hash, is_admin FROM users WHERE email = $1`,
      [email]
    );
    const user = result.rows[0];

    // If user not found or password doesn't match
    if (!user || !(await compare(password_plain, user.password_hash))) {
      console.error("Email ou mot de passe incorrect.");
      return null;
    }

    console.log("Connexion réussie. Bienvenue, " + user.username + "!");
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
      `SELECT id, username, email, is_admin, created_at FROM users WHERE id = $1`,
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
      `SELECT id, username, email, is_admin, created_at FROM users ORDER BY created_at DESC`
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
