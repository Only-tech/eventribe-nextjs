export type Event = {
  id: string;
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

export type User = {
  id: string;
  email: string;
  password_hash: string;
  is_admin: boolean;
  created_at: string;
  first_name: string;
  last_name: string;
};

export type Registration = {
  id: string;
  user_id: string;
  event_id: string;
  registered_at: string;
};

export type Participant = {
  user_id: number;
  first_name: string;
  email: string;
  registered_at: string;
};
