----------- Users Table -----------
create table public.users (
    id serial not null,
    first_name character varying(50) not null,
    email character varying(100) not null,
    password_hash character varying(255) not null,
    is_admin boolean null default false,
    created_at timestamp without time zone null default CURRENT_TIMESTAMP,
    last_name character varying(100) null,
    two_factor_enabled boolean null default false,
    two_factor_code character varying(6) null,
    two_factor_expires_at timestamp without time zone null,
    constraint users_pkey primary key (id),
    constraint users_email_key unique (email),
    constraint users_username_key unique (first_name)
)   TABLESPACE pg_default;


----------- Registrations Table -------------
create table public.registrations (
    id serial not null,
    user_id integer not null,
    event_id integer not null,
    registered_at timestamp without time zone null default CURRENT_TIMESTAMP,
    constraint registrations_pkey primary key (id),
    constraint registrations_user_id_event_id_key unique (user_id, event_id),
    constraint registrations_event_id_fkey foreign KEY (event_id) references events (id) on delete CASCADE,
    constraint registrations_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
)   TABLESPACE pg_default;

create index IF not exists idx_registrations_user_id on public.registrations using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_registrations_event_id on public.registrations using btree (event_id) TABLESPACE pg_default;


--------------- Events Table --------------------
create table public.events (
    id serial not null,
    title character varying(255) not null,
    description_short text not null,
    description_long text not null,
    event_date timestamp without time zone not null,
    location character varying(255) not null,
    available_seats integer not null,
    image_url character varying(255) null,
    created_at timestamp without time zone null default CURRENT_TIMESTAMP,
    created_by integer null,
    price numeric(10, 2) null default 0,
    constraint events_pkey primary key (id),
    constraint fk_created_by foreign KEY (created_by) references users (id) on delete CASCADE,
    constraint events_available_seats_check check ((available_seats >= 0))
)   TABLESPACE pg_default;

create index IF not exists idx_events_event_date on public.events using btree (event_date) TABLESPACE pg_default;


---------------- Payments Table ------------------
create table public.payments (
    id serial not null,
    user_id integer not null,
    event_id integer not null,
    amount numeric(10, 2) not null,
    status character varying(20) null default 'pending'::character varying,
    created_at timestamp without time zone null default now(),
    constraint payments_pkey primary key (id),
    constraint payments_event_id_fkey foreign KEY (event_id) references events (id) on delete CASCADE,
    constraint payments_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
)   TABLESPACE pg_default;

create index IF not exists idx_payments_user_id on public.payments using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_payments_event_id on public.payments using btree (event_id) TABLESPACE pg_default;


---------------- Payment Methods Table --------------------------
create table public.payment_methods (
    id serial not null,
    user_id integer not null,
    card_last4 character varying(4) not null,
    card_brand character varying(20) null,
    created_at timestamp without time zone null default now(),
    constraint payment_methods_pkey primary key (id),
    constraint payment_methods_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
)   TABLESPACE pg_default;

create index IF not exists idx_payment_methods_user_id on public.payment_methods using btree (user_id) TABLESPACE pg_default;


------------------ Password Resets ----------------------------
create table public.password_resets (
    id serial not null,
    user_id integer null,
    code character varying(6) not null,
    expires_at timestamp without time zone not null,
    created_at timestamp without time zone null default now(),
    constraint password_resets_pkey primary key (id),
    constraint password_resets_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
)   TABLESPACE pg_default;


------------------- Email Verifications ---------------------------
create table public.email_verifications (
    email character varying(255) not null,
    verification_code character varying(6) not null,
    expires_at timestamp with time zone not null,
    constraint email_verifications_pkey primary key (email)
)   TABLESPACE pg_default;



--------------  Events Rows Data BackUp ----------------------------
INSERT INTO "public"."events" ("id", "title", "description_short", "description_long", "event_date", "location", "available_seats", "image_url", "created_at", "created_by", "price") VALUES ('2', 'Conférences IA 2025', 'Une journée dédiée à l''intelligence artificielle, le numérique penseur.', 'Experts, startups et chercheurs se réunissent pour discuter des dernières avancées en IA. Conférences, ateliers et networking au programme.', '2026-05-15 13:00:00', 'Palais des Congrès, Paris', '250', 'https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/IA.png', '2025-07-17 20:44:24', null, '0.00'), ('3', 'Salon International Robotique', 'Innovations, démonstrations et conférences autour de la robotique', 'Le Salon International de la Robotique réunit les leaders mondiaux du secteur : robots industriels, humanoïdes, IA embarquée, drones autonomes, et plus encore. Venez découvrir les dernières avancées technologiques, assister à des démonstrations en direct, et rencontrer les experts du domaine.', '2026-02-20 16:30:00', 'Parc des Expositions, Lyon', '500', 'https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/robbot.png', '2025-07-17 15:46:49', null, '0.00'), ('5', 'Salon International Dégustation', 'Vins du monde et ateliers sensoriels, entre dégustation et découverte. ', 'Une rencontre internationale autour des vins. Chaque stand représente une région viticole : Bordeaux, Toscane, Napa Valley, Mendoza… avec des ateliers olfactifs, accords mets-vins et masterclasses par des sommeliers renommés.', '2025-11-08 07:00:00', 'Palais des Congrès, Paris', '1000', 'https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/salonDesgustation.png', '2025-07-18 06:51:08', null, '8.99'), ('6', 'Nuit des Chefs-d’œuvre (Opéra)', 'Une soirée lyrique dans la Cour Napoléon, au pied de la pyramide du Louvre', 'Le musée du Louvre ouvre ses portes à l’art lyrique. Dans un décor majestueux sous les étoiles, découvrez un opéra en plein air mettant en scène des extraits de Mozart, Puccini et Verdi. Un orchestre symphonique et des solistes internationaux interprètent les grands classiques dans une scénographie subtile, entre patrimoine et émotion.', '2025-12-21 12:00:00', 'Musée du Louvre, Cour Napoléon', '1200', 'https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/OperaLouvre.png', '2025-07-18 14:53:09', null, '0.00'), ('7', 'Festival des Vins de Bourgogne', 'Une célébration des cépages emblématiques de Bourgogne', 'Venez découvrir les grands crus de Bourgogne au cœur de la région. Dégustations guidées, balades dans les vignes, conférences sur l’histoire viticole et rencontre avec les vignerons. Une immersion dans le terroir bourguignon.', '2026-01-14 15:00:00', 'Beaune, Hôtel-Dieu et vignobles', '600', 'https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/vigneron.png', '2025-07-18 20:55:08', '23', '0.00'), ('8', 'Florent Pagny Tournée Liberté', 'Un concert exceptionnel de Florent Pagny, entre émotion et puissance', 'Florent Pagny revient sur scène avec sa tournée Liberté, célébrant ses plus grands succès et son parcours artistique. Une soirée intense où se mêlent les classiques comme Savoir aimer, Ma liberté de penser, et Caruso. Accompagné de musiciens talentueux et d’une scénographie immersive, ce concert promet un moment inoubliable.', '2026-04-15 12:30:00', 'Zénith de Nantes', '5000', 'https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/florentPagny.png', '2025-07-27 13:57:00.328309', null, '0.00'), ('10', 'Entre Art et Artiste', 'Une immersion créative où artistes et passionnés se rencontrent pour explorer les liens entre l''œuvre et son créateur.', 'Entre Art et Artiste est une rencontre multidisciplinaire qui célèbre l’intimité entre l’artiste et son œuvre. À travers des expositions, des performances et des discussions ouvertes, cet événement invite le public à découvrir les coulisses de la création artistique.
Peintres, sculpteurs, photographes et musiciens partageront leurs processus, leurs inspirations et leurs doutes dans un cadre chaleureux et interactif.', '2026-02-05 13:20:00', 'L''atelier Théâtrale ', '50', 'https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/Art%20Artist.jpeg', '2025-08-05 00:08:22.466962', null, '0.00'), ('16', 'Vibrations Urbaines Live & DJ Set', 'Une soirée immersive mêlant concerts live, DJ sets électro et ambiance chill dans un lieu atypique au cœur de Dijon.', 'Plongez dans l’univers des Vibrations Urbaines, une expérience musicale unique où les genres se croisent :
    🎤 Live acoustique avec Léa Nova (pop soul)
    🎧 DJ set deep house avec DJ Kortex
    🎷 Jam session ouverte en fin de soirée
Le tout dans une atmosphère chaleureuse, avec food trucks, bar à cocktails, et espace chill-out. Dress code : libre, mais stylé.', '2025-11-29 16:00:00', 'La Friche Musicale, Dijon', '2200', 'https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/DarkSmoke.jpg', '2025-08-31 00:26:07.520511', '23', '0.00'), ('18', 'Hunter × Hunter Fans Party', 'Un après-midi immersif Hunter × Hunter, avec quiz, épreuves stratégiques et projection d’un épisode culte.', 'Devenez un véritable Hunter en passant des épreuves ludiques et stratégiques : quiz sur les arcs emblématiques (Greed Island, York Shin City, Chimera Ant), jeu de rôle en équipe, tournoi de cartes, et projection d’un épisode culte suivie d’un débat entre passionnés. Cosplay libre, stand de goodies, photobooth Greed Island et tirage au sort pour gagner des coffrets manga ou DVD. Un badge officiel de Hunter sera remis aux participants ayant relevé tous les défis. Préparez votre Nen, votre esprit d’équipe et votre sens de l’aventure !', '2025-11-20 00:00:00', 'Maison des Associations, Nevers', '150', 'https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/hunterX.jpg', '2025-08-31 18:33:44.970271', '23', '7.99'), ('32', 'Stromae Multitude Tour', 'Une soirée électro-pop avec l’artiste belge-français Stromae', 'Stromae revient sur scène avec son album Multitude. Ce concert exceptionnel mêle performance vocale, scénographie immersive et rythmes électro-pop. Une expérience musicale et visuelle unique, portée par des titres comme L’enfer, Santé et Papaoutai.', '2026-04-06 20:00:00', 'Accor Arena, Paris', '12000', 'https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/stromae.png', '2025-10-06 10:30:16.038791', '23', '0.00'), ('33', 'Changer de Cap Reconversion', 'Une journée pour explorer les opportunités de reconversion professionnelle', 'Ce forum s’adresse à celles et ceux qui envisagent un changement de carrière, une réorientation ou un nouveau projet professionnel. Sur place : ateliers pratiques, bilans de compétences, témoignages d’anciens reconvertis, présence de centres de formation, organismes publics et recruteurs spécialisés.', '2026-05-06 09:30:00', 'Cité des Métiers, Lyon', '300', 'https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/reconversion.png', '2025-10-06 10:35:10.444677', '23', '0.00'), ('34', 'L’Art en Scène Pluridisciplinaire', 'Théâtre, peinture et performance réunis sur une même scène', 'Une soirée immersive où les arts visuels rencontrent les arts du spectacle. Sur scène : un monologue poétique, un peintre qui crée en direct, des projections numériques interactives, et une danse contemporaine improvisée. L’objectif : offrir une expérience sensorielle et réflexive, qui célèbre la créativité sous toutes ses formes.', '2026-04-06 19:00:00', 'La Maison de la Culture, Nevers', '450', 'https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/artCulture.png', '2025-10-06 10:38:17.008853', '23', '4.99');





















-- -- Table des utilisateurs
-- CREATE TABLE IF NOT EXISTS users (
--     id SERIAL PRIMARY KEY,
--     username VARCHAR(50) UNIQUE NOT NULL,
--     email VARCHAR(100) UNIQUE NOT NULL,
--     password_hash VARCHAR(255) NOT NULL, -- Stocke le hash du mot de passe
--     is_admin BOOLEAN DEFAULT FALSE,     -- Gestion des rôles
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Table des événements
-- CREATE TABLE IF NOT EXISTS events (
--     id SERIAL PRIMARY KEY,
--     title VARCHAR(255) NOT NULL,
--     description_short TEXT NOT NULL,
--     description_long TEXT NOT NULL,
--     event_date TIMESTAMP NOT NULL,
--     location VARCHAR(255) NOT NULL,
--     available_seats INTEGER NOT NULL CHECK (available_seats >= 0),
--     image_url VARCHAR(255), -- URL de l'image de l'événement
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Table des inscriptions (lien entre utilisateurs et événements)
-- CREATE TABLE IF NOT EXISTS registrations (
--     id SERIAL PRIMARY KEY,
--     user_id INTEGER NOT NULL,
--     event_id INTEGER NOT NULL,
--     registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--     FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
--     UNIQUE (user_id, event_id) -- Un utilisateur ne peut s'inscrire qu'une seule fois au même événement
-- );

-- -- Index pour améliorer les performances des requêtes
-- CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations (user_id);
-- CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations (event_id);
-- CREATE INDEX IF NOT EXISTS idx_events_event_date ON events (event_date);


-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- INSERT INTO users (username, email, password_hash, is_admin)
-- VALUES (
--     'admin',
--     'admin@events.com',
--     crypt('eventsmanager', gen_salt('bf')),
--     TRUE
-- );