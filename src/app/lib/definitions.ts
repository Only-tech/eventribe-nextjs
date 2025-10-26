export type Event = {
    id: number;
    title: string;
    description_short: string;
    description_long: string;
    event_date: string;
    location: string;
    available_seats: number;
    image_url: string | null;
    registered_count: number;
    created_by: string;
};

export type RegisteredEvent = {
    id: number;
    title: string;
    event_date: string;
    location: string;
    description_short: string;
    description_long: string;
    image_url: string | null;
    registered_at: string;
    registered_count: number;
}


export type User = {
    id: number;
    email: string;
    password_hash: string;
    is_admin: boolean;
    created_at: string;
    first_name: string;
    last_name: string;
};

export type Registration = {
    id: number;
    user_id: number;
    event_id: number;
    registered_at: string;
};

export type Participant = {
    user_id: number;
    first_name: string;
    email: string;
    registered_at: string;
};