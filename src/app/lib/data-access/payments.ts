import { pool } from '@/app/lib/data-access/db';
import { Payment } from '@/app/lib/definitions';

export async function createPayment(userId: number, eventId: number, amount: number): Promise<Payment | null> {
    const client = await pool.connect();
    try {
        const result = await client.query<Payment>(
            `INSERT INTO payments (user_id, event_id, amount, status)
            VALUES ($1, $2, $3, 'succeeded')
            RETURNING id, user_id, event_id, amount, status, created_at`,
            [userId, eventId, amount]
        );
        return result.rows[0] || null;
    } finally {
        client.release();
    }
}

export async function deletePayment(userId: number, eventId: number): Promise<boolean> {
    const client = await pool.connect();
    try {
        await client.query(`DELETE FROM payments WHERE user_id = $1 AND event_id = $2`, [userId, eventId]);
        return true;
    } finally {
        client.release();
    }
}
