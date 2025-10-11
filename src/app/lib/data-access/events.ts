'use server'; 

import { pool } from '@/app/lib/data-access/db';
import { Event, Participant, Registration, User } from '@/app/lib/definitions';
import { unstable_noStore as noStore } from 'next/cache';
import { sendNotificationEmail } from '@/app/lib/services/email'; // Import corrigé

/**
 * Fetch Images Url from DB with random option.
 * @returns Images URL.
 */
export async function fetchEventImageUrls(): Promise<string[]> {
  noStore();
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`
      SELECT image_url FROM events
      WHERE image_url IS NOT NULL
      ORDER BY RANDOM()
      LIMIT 10;
    `);
    const imageUrls = result.rows.map(row => row.image_url);
    console.log(`Récupération de ${imageUrls.length} URL d'images pour l'écran de bienvenue.`);
    return imageUrls;
  } catch (error) {
    console.error("Erreur lors de la récupération des URL d'images :", error);
    return [];
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Fetch Events from DB with Search option.
export async function fetchEvents(query: string): Promise<Event[]> {
  // Prevents data caching to ensure up-to-date information.
  noStore();

  let client; 
  try {
    console.log('Fetching events from the database...');
    client = await pool.connect();

    let queryText = `
      SELECT
        e.id,
        e.title,
        e.event_date,
        e.location,
        e.description_short,
        e.description_long,
        e.available_seats,
        e.image_url,
        e.created_by,
        CAST(COUNT(r.id) AS INTEGER) AS registered_count
      FROM
        events e
      LEFT JOIN
        registrations r ON e.id = r.event_id
    `;
    
    const params = [];
    if (query) {
      queryText += `
        WHERE
          e.title ILIKE $1 OR
          e.description_short ILIKE $1 OR
          e.description_long ILIKE $1
      `;
      params.push(`%${query}%`);
    }

    queryText += `
      GROUP BY
        e.id
      ORDER BY
        e.event_date ASC
    `;

    const data = await client.query(queryText, params);
    
    console.log('Events fetched successfully:', data.rows.length);
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch events.');
  } finally {
    if (client) {
      client.release(); // Ensure client is released even if an error occurs
    }
  }
}


/**
 * Fetches events created by a specific user.
 * @param userId The ID of the user.
 * @returns A list of events.
 */
export async function fetchEventsByUserId(userId: number): Promise<Event[]> {
  noStore();

  let client;
  try {
    client = await pool.connect();
    const result = await client.query<Event>(
      `SELECT
        e.id,
        e.title,
        e.description_short,
        e.description_long,
        e.event_date,
        e.location,
        e.available_seats,
        e.image_url,
        e.created_by,
        CAST(COUNT(r.id) AS INTEGER) AS registered_count
      FROM
        events e
      LEFT JOIN
        registrations r ON e.id = r.event_id
      WHERE
        e.created_by = $1
      GROUP BY
        e.id
      ORDER BY
        e.event_date ASC;`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Erreur lors de la récupération des événements de l\'utilisateur:', error);
    return [];
  } finally {
    if (client) {
      client.release();
    }
  }
}


// fetches events where id and created_by
export async function fetchUserEventById(userId: number, eventId: number): Promise<Event | null> {
  const client = await pool.connect();
  try {
    const result = await client.query<Event>(
      `SELECT * FROM events WHERE id = $1 AND created_by = $2`,
      [eventId, userId]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}



/**
 * Get all Events with Registration Count.
 * @returns {Promise<Event[]>}Events List.
 */
export async function getAllEventsWithRegistrationCount(): Promise<Event[]> {
  noStore();
  let client; 
  try {
    client = await pool.connect();
    const queryText = `
      SELECT
        e.id,
        e.title,
        e.event_date,
        e.location,
        e.description_short,
        e.description_long,
        e.available_seats,
        e.image_url,
        e.created_by,
        CAST(COUNT(r.id) AS INTEGER) AS registered_count
      FROM
        events e
      LEFT JOIN
        registrations r ON e.id = r.event_id
      GROUP BY
        e.id, e.title, e.event_date, e.location, e.description_short, e.available_seats, e.image_url
      ORDER BY
        e.event_date ASC
    `;
    const data = await client.query(queryText);
    console.log('All events with registration count fetched successfully:', data.rows.length);
    return data.rows;
  } catch (error) {
    console.error('Database Error: Failed to fetch all events with registration count.', error);
    return [];
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Fetches a specific event by ID.
export async function fetchEventById(id: number): Promise<Event | null> {
  noStore();
  let client; 
  try {
    console.log(`Fetching event with id: ${id}`);
    client = await pool.connect();
    const queryText = `
      SELECT
        e.id,
        e.title,
        e.event_date,
        e.location,
        e.description_short,
        e.description_long,
        e.available_seats,
        e.image_url,
        e.created_by,
        CAST(COUNT(r.id) AS INTEGER) AS registered_count
      FROM
        events e
      LEFT JOIN
        registrations r ON e.id = r.event_id
      WHERE
        e.id = $1
      GROUP BY
        e.id
    `;
    const data = await client.query(queryText, [id]);

    if (data.rows.length > 0) {
      console.log('Event fetched successfully.');
      return data.rows[0];
    } else {
      console.log('Event not found.');
      return null;
    }
  } catch (error) {
    console.error('Database Error:', error);
    return null;
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * Fetches events registered by a specific user.
 * @param userId 
 * @returns An array of registered events.
 */
export async function fetchRegisteredEventsForUser(userId: string): Promise<(Event & { registered_at: string })[]> {
  noStore();
  let client; 
  try {
    console.log(`Fetching registered events for user: ${userId}`);
    client = await pool.connect();
    const queryText = `
      SELECT
        e.id,
        e.title,
        e.event_date,
        e.location,
        e.description_short,
        e.description_long,
        e.available_seats,
        e.image_url,
        r.registered_at,
        e.created_by,
        CAST(COUNT(reg.id) AS INTEGER) AS registered_count
      FROM
        events e
      JOIN
        registrations r ON e.id = r.event_id
      LEFT JOIN
        registrations reg ON e.id = reg.event_id
      WHERE
        r.user_id = $1
      GROUP BY
        e.id, r.registered_at
      ORDER BY
        e.event_date ASC
    `;
    const data = await client.query(queryText, [userId]);
    console.log('Registered events fetched successfully:', data.rows.length);
    return data.rows.map(row => ({
      ...row,
      // Ensure that event_date and registered_at are correctly typed as strings
      event_date: row.event_date.toISOString(),
      registered_at: row.registered_at.toISOString(),
    }));
  } catch (error) {
    console.error('Database Error: Failed to fetch registered events for user.', error);
    return [];
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * Registers a user for an event.
 * @param userId 
 * @param eventId 
 * @returns Successful, false otherwise.
 */
export async function registerForEvent(userId: number, eventId: number): Promise<boolean> {
  noStore();
  let client;
  try {
    client = await pool.connect();

    // Check if user is already registered
    const existingRegistration = await client.query<Registration>(
      `SELECT id FROM registrations WHERE user_id = $1 AND event_id = $2`,
      [userId, eventId]
    );
    if (existingRegistration.rows.length > 0) {
      console.warn("User is already registered for this event.");
      return false;
    }

    // Check if seats are available
    const eventResult = await client.query<Event>(
      `SELECT title, available_seats FROM events WHERE id = $1`,
      [eventId]
    );
    const event = eventResult.rows[0];
    const registeredCountResult = await client.query(
      `SELECT COUNT(*) FROM registrations WHERE event_id = $1`,
      [eventId]
    );
    const registeredCount = parseInt(registeredCountResult.rows[0].count, 10);

    if (!event || registeredCount >= event.available_seats) {
      console.warn("No seats available or event not found.");
      return false;
    }

    await client.query('BEGIN');

    await client.query(
      `INSERT INTO registrations (user_id, event_id, registered_at) VALUES ($1, $2, NOW())`,
      [userId, eventId]
    );

    await client.query('COMMIT'); 
    console.log("Registration successful!");
    // Send confirmation mail
    try {
        const userResult = await client.query<User>(`SELECT email, first_name FROM users WHERE id = $1`, [userId]);
        const user = userResult.rows[0];

        if (user && event) {
            const subject = `Confirmation d'inscription à l'événement : ${event.title}`;
            const html = `
                <div style="font-family: Inter, sans-serif; max-width: 480px; margin: auto;">
                    <p>Bonjour ${user.first_name},</p>
                    <p>Votre inscription à l'événement <strong>${event.title}</strong> a bien été enregistrée.</p>
                    <p>Nous sommes ravis de vous compter parmi nous !</p>
                    <p style="margin-top: 24px; color: #666; font-size: 13px;">L'équipe eventribe</p>
                </div>
            `;
            await sendNotificationEmail(user.email, subject, html);
        }
    } catch (emailError) {
        console.error("L'inscription a réussi, mais l'envoi de l'e-mail a échoué :", emailError);
    }
    return true;
  } catch (error) {
    if (client) { 
      await client.query('ROLLBACK');
    }
    console.error("Error during event registration:", error);
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * Unregisters a user from an event.
 * @param userId 
 * @param eventId 
 * @returns Successful, false otherwise.
 */
export async function unregisterFromEvent(userId: number, eventId: number): Promise<boolean> {
  noStore();
  let client; 
  try {
    client = await pool.connect();

    // Check if user is actually registered
    const existingRegistrationResult = await client.query<Registration>(
      `SELECT id FROM registrations WHERE user_id = $1 AND event_id = $2`,
      [userId, eventId]
    );

    if (existingRegistrationResult.rows.length === 0) {
      console.warn("User is not registered for this event, cannot unregister.");
      return false; 
    }

    // Catch informations before deleting
    const userResult = await client.query<User>(`SELECT email, first_name FROM users WHERE id = $1`, [userId]);
    const eventResult = await client.query<Event>(`SELECT title FROM events WHERE id = $1`, [eventId]);
    const user = userResult.rows[0];
    const event = eventResult.rows[0];

    await client.query('BEGIN');

    const deleteResult = await client.query(
      `DELETE FROM registrations WHERE user_id = $1 AND event_id = $2`,
      [userId, eventId]
    );

    // Only proceed if a row was actually deleted
    if (deleteResult.rowCount === 0) {
      await client.query('ROLLBACK');
      console.warn("Unregistration failed, user was not registered.");
      return false;
    }

    await client.query('COMMIT'); 
    console.log("Unregistration successful!");

    // Send unregister confirmation
    try {
        if (user && event) {
            const subject = `Notification de désinscription de l'événement : ${event.title}`;
            const html = `
                <div style="font-family: Inter, sans-serif; max-width: 480px; margin: auto;">
                    <p>Bonjour ${user.first_name},</p>
                    <p>Ceci est une confirmation que vous avez été désinscrit(e) de l'événement <strong>${event.title}</strong>.</p>
                    <p>Cette action a peut-être été réalisée par vous-même ou par un administrateur.</p>
                    <p style="margin-top: 24px; color: #666; font-size: 13px;">L'équipe eventribe</p>
                </div>
            `;
            await sendNotificationEmail(user.email, subject, html);
        }
    } catch (emailError) {
        console.error("La désinscription a réussi, mais l'envoi de l'e-mail a échoué :", emailError);
    }
    return true;
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK'); // Rollback on error
    }
    console.error("Error during event unregistration:", error);
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * Checks if a user is registered for an event.
 * @param userId 
 * @param eventId 
 * @returns True if registered, false otherwise.
 */
export async function isUserRegisteredForEvent(userId: number, eventId: number): Promise<boolean> {
  noStore();
  let client; 
  try {
    client = await pool.connect();
    const result = await client.query<Registration>(
      `SELECT id FROM registrations WHERE user_id = $1 AND event_id = $2`,
      [userId, eventId]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking user registration for event:", error);
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * Retrieves the list of participants for a given event.
 * @param eventId
 * @returns Array of participants.
 */
export async function getParticipantsForEvent(eventId: number): Promise<Participant[]> { 
  noStore();
  let client; 
  try {
    client = await pool.connect();
    const queryText = `
      SELECT
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.email,
        r.registered_at
      FROM
        users u
      JOIN
        registrations r ON u.id = r.user_id
      WHERE
        r.event_id = $1
      ORDER BY
        r.registered_at ASC
    `;
    const data = await client.query(queryText, [eventId]);
    return data.rows as Participant[];
  } catch (error) {
    console.error("Error fetching participants for event:", error);
    return [];
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * Counts the total number of registrations.
 * @returns The total number of registrations.
 */
export async function countRegistrations(): Promise<number> {
  noStore();
  let client; 
  try {
    client = await pool.connect();
    const result = await client.query(`SELECT COUNT(*) FROM registrations`);
    return Number(result.rows[0].count);
  } catch (error) {
    console.error("Error counting registrations:", error);
    return 0;
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * Creates a new event.
 * @param data
 * @returns True if creation is successful, false otherwise.
 */
export async function createEvent(data: Omit<Event, 'id' | 'registered_count'>): Promise<boolean> {
  noStore();
  let client; 
  try {
    client = await pool.connect();
    await client.query(
      `INSERT INTO events (title, description_short, description_long, event_date, location, available_seats, image_url, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [data.title, data.description_short, data.description_long, data.event_date, data.location, data.available_seats, data.image_url, data.created_by]
    );
    console.log("Event created successfully!");
    return true;
  } catch (error) {
    console.error("Error creating event:", error);
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * Updates an existing event.
 * @param eventId
 * @param data
 * @returns True if the update is successful, false otherwise.
 */
export async function updateEvent(eventId: number, data: Omit<Event, 'id' | 'registered_count'>): Promise<boolean> {
  noStore();
  let client; 
  try {
    client = await pool.connect();
    await client.query(
      `UPDATE events
       SET
         title = $1,
         description_short = $2,
         description_long = $3,
         event_date = $4,
         location = $5,
         available_seats = $6,
         image_url = $7
       WHERE id = $8`,
      [data.title, data.description_short, data.description_long, data.event_date, data.location, data.available_seats, data.image_url, eventId]
    );
    console.log("Event updated successfully!");
    return true;
  } catch (error) {
    console.error("Error updating event:", error);
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * Deletes an event.
 * @param eventId 
 * @returns Successful, false otherwise.
 */
export async function deleteEvent(eventId: number): Promise<boolean> {
  noStore();
  let client;
  try {
    client = await pool.connect();
    await client.query(`DELETE FROM events WHERE id = $1`, [eventId]);
    console.log("Event deleted successfully!");
    return true;
  } catch (error) {
    console.error("Error deleting event:", error);
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
}
// Déplacez ici :
// - fetchEventImageUrls
// - fetchEvents
// - fetchEventsByUserId
// - ... et toutes les autres fonctions de data.ts