'use server';

import { pool } from '@/app/lib/data-access/db';
import { PaymentMethod } from '@/app/lib/definitions';

// List user payment-methods
export async function fetchPaymentMethods(userId: number): Promise<PaymentMethod[]> {
    const client = await pool.connect();
    try {
        const result = await client.query<PaymentMethod>(
            `SELECT id, card_brand, card_last4, created_at
            FROM payment_methods
            WHERE user_id = $1
            ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows;
    } finally {
        client.release();
    }
}

// Add payment-methods
export async function addPaymentMethod(
    userId: number,
    card_brand: string,
    card_last4: string
): Promise<PaymentMethod> {
    const client = await pool.connect();
    try {
        const result = await client.query<PaymentMethod>(
            `INSERT INTO payment_methods (user_id, card_brand, card_last4)
            VALUES ($1, $2, $3)
            RETURNING id, card_brand, card_last4, created_at`,
            [userId, card_brand, card_last4]
        );
        return result.rows[0];
    } finally {
        client.release();
    }
}

// Delete payment-methods
export async function deletePaymentMethod(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
        await client.query(`DELETE FROM payment_methods WHERE id = $1`, [id]);
        return true;
    } finally {
        client.release();
    }
}

