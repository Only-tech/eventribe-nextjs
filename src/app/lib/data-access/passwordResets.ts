import { pool } from '@/app/lib/data-access/db';
import { hash } from 'bcrypt';

// Create an OTP code
export async function createResetCode(userId: number, code: string, expiresAt: Date): Promise<boolean> {
    const client = await pool.connect();
    try {
        await client.query(
        `INSERT INTO password_resets (user_id, code, expires_at) VALUES ($1, $2, $3)`,
        [userId, code, expiresAt]
        );
        return true;
    } catch (err) {
        console.error('Erreur createResetCode:', err);
        return false;
    } finally {
        client.release();
    }
}

// Verify if OTP code is valid for a user
export async function verifyResetCode(userId: number, code: string): Promise<boolean> {
    const client = await pool.connect();
    try {
        const res = await client.query(
        `SELECT id FROM password_resets WHERE user_id = $1 AND code = $2 AND expires_at > NOW() LIMIT 1`,
        [userId, code]
        );
        return res.rows.length > 0;
    } catch (err) {
        console.error('Erreur verifyResetCode:', err);
        return false;
    } finally {
        client.release();
    }
}

// Delete user OTP after success
export async function consumeResetCodes(userId: number): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query(`DELETE FROM password_resets WHERE user_id = $1`, [userId]);
    } finally {
        client.release();
    }
}

// Reset password
export async function resetUserPassword(userId: number, newPassword: string): Promise<boolean> {
    const client = await pool.connect();
    try {
        const password_hash = await hash(newPassword, 10);
        await client.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [password_hash, userId]);
        return true;
    } catch (err) {
        console.error('Erreur resetUserPassword:', err);
        return false;
    } finally {
        client.release();
    }
}
