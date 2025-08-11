# eventribe — Event Management

**eventribe** (_a platform that connects people with shared interests_) empowers users and admins to manage events effectively via a public-facing interface and a dedicated admin panel.

---

## Features

### For Users

- **Browse Events**: Discover events with detailed cards.
- **Event Details**: See full descriptions, dates, location, availability, and register.
- **Registration System**: Sign up or cancel registration with live availability updates.
- **Authentication**: Sign up, log in, and manage sessions securely.
- **Responsive Design**: Seamless experience across all devices.
- **Animations**: Scroll-based animations (AOS) enhance the user experience.
- **Reusable Components**: Maintainable and cohesive UI with EventCard, Header, etc.

### For Admins

- **Event Management (CRUD)**: Add, view, update, or delete events.
- **User Management**: Promote users to admin roles.
- **Registration Oversight**: Unregister participants manually.
- **Participation Statistics**: View engagement metrics.

---

## Tech Stack

- **Next.js** – React framework for SSR and routing
- **React** – UI development
- **Tailwind CSS** – Utility-first styling
- **TypeScript** – Type-safe JavaScript
- **NextAuth.js** – Authentication for Next.js
- **Heroicons** – Stylish icons
- **AOS** – Animate On Scroll library

---

## Project Structure

```
eventribe-nextjs/
├── .next/                  # Build output
├── node_modules/           # Dependencies
├── public/                 # Static assets
│   └── images/             # App images
├── src/ app/
│   ├── (main)/         # User pages
│   │   ├── event/[id]/page.tsx
│   │   ├── legal-mentions/page.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── my-events/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── admin/(admin)/  # Admin dashboard
│   │   ├── manage-events/page.tsx
│   │   ├── manage-users/page.tsx
│   │   ├── manage-registrations/page.tsx
│   │   ├── ui/
│   │   │   ├── admin-footer.tsx
│   │   │   └── admin-header.tsx
│   │   ├── icon.svg
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── admin/
│   │   │   ├── events/route.ts
│   │   │   ├── registrations/route.ts
│   │   │   └── users/route.ts
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts
│   │   │   ├── login/route.ts
│   │   │   └── register/route.ts
│   │   ├── my-events/route.ts
│   │   ├── unregister-event/route.ts
│   │   └── upload/route.ts
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── data.ts
│   │   ├── definitions.ts
│   │   └── utils.ts
│   ├── ui/
│   │   ├── confirmation-modal.tsx
│   │   ├── contact-modal.tsx
│   │   ├── EventCard.tsx
│   │   ├── footer.tsx
│   │   ├── header.tsx
│   │   └── on-top-button.tsx
│   ├── globals.css
│   ├── icon.svg
│   ├── layout.tsx
│   └── providers.tsx
├── .env.local
├── package.json
├── tsconfig.json
├── next.config.js
├── .gitignore
├── LICENSE.md
└── README.md
```

---

## 📦 Getting Started

### Prerequisites

Make sure **Node.js** is installed. [Download here](https://nodejs.org)

### Installation Steps

```bash
# Clone the repo
git clone https://github.com/Only-tech/eventribe-nextjs.git
cd eventribe-nextjs

# Install dependencies
npm install
# or
yarn install

# Run dev server
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to explore the app.

> Note: This project is connected to a Supabase database restored from the original PHP-based eventribe backend.

---

## Author

**Cédrick FEUMEGNE**

---

## License

This project is licensed under the terms specified in `/LICENSE.md`.

---

## Additional Setup Tips

If you’re starting a new project, run:

```bash
npx create-next-app@latest waitlist-landing-page
```

Recommended config responses:

- Use TypeScript → **Yes**
- Enable ESLint → **Yes**
- Use Tailwind → **Yes**
- Enable `src/` → **Yes**
- Use App Router → **Yes**
- Customize aliases → **No**

Let the install complete—it’ll download and configure everything you need.

---

---

# Application Web de Gestion d'Événements → eventribe

**eventribe** (𝘳𝘢𝘴𝘴𝘦𝘮𝘣𝘭𝘦 𝘥𝘦𝘴 𝘱𝘦𝘳𝘴𝘰𝘯𝘯𝘦𝘴 𝘱𝘢𝘳𝘵𝘢𝘨𝘦𝘢𝘯𝘵 𝘥𝘦𝘴 𝘤𝘦𝘯𝘵𝘳𝘦𝘴 𝘥'𝘪𝘯𝘵é𝘳ê𝘵𝘴 𝘤𝘰𝘮𝘮𝘶𝘯𝘴) permet de gérer des événements avec un front-office (créer un compte, s'inscrire et se désinscrire d'un événement) pour les visiteurs et un back-office (ajouter, afficher, modifier, supprimer un événement → 𝐂𝐑𝐔𝐃, désinscrire des participants d'un événement, consulter les statistiques de participations, changer le statut d'un utilisateur en administrateur) pour l'administration.

---

### Fonctionnalités principales

- **Découverte d'Événements** : Parcourez et explorez une liste d'événements avec des cartes d'information détaillées.

- **Détails d'Événement** : Chaque événement possède une page dédiée affichant une description complète, les dates, le lieu, le nombre de places restantes, et la possibilité de s'y inscrire.

- **Système d'Inscription** : Les utilisateurs peuvent s'inscrire ou se désinscrire des événements. Le nombre de places disponibles est mis à jour en temps réel.

- **Authentification Utilisateur** : Un système d'authentification robuste permet aux utilisateurs de s'inscrire, de se connecter et de gérer leur session.

- **Interface Réactive** : L'application est entièrement responsive et s'adapte parfaitement à toutes les tailles d'écran, du mobile au bureau.

- **Effets Visuels** : Utilisation d'animations au défilement (AOS) pour une expérience utilisateur plus dynamique et engageante.

- **Composants Réutilisables** : Des composants bien conçus comme EventCard et Header garantissent la cohérence de l'interface et la facilité de maintenance.

---

### Technologies Utilisées

Ce projet est une application web full-stack utilisant les technologies suivantes :

- **Next.js** : Framework React pour un rendu côté serveur, le routage et une performance optimisée.

- **React** : Bibliothèque JavaScript pour la construction de l'interface utilisateur.

- **Tailwind CSS** : Un framework CSS utility-first pour un stylisme rapide et efficace.

- **NextAuth.js** : Une solution d'authentification complète et flexible pour les applications Next.js.

- **Heroicons** : Une collection d'icônes professionnelles pour l'interface utilisateur.

- **AOS (Animate On Scroll)** : Une bibliothèque pour ajouter des animations CSS déclenchées par le défilement.

- **TypeScript** : Un surensemble de JavaScript qui ajoute le typage statique pour une meilleure robustesse du code.

---

### Structure du Projet

Le projet suit une structure de fichiers et de dossiers standard et organisée, typique d'une application Next.js, d'autres fichiers et dossiers ne sont pas mentionnés ici.

```
eventribe-nextjs/
├── .next/                        # Dossier généré automatiquement après le build (ne pas modifier)
├── node_modules/                 # Bibliothèques installées via npm
├── public/                       # Fichiers statiques accessibles publiquement
│   └── images/                   # Images utilisées dans l’application
├── src/app/                      # Code source principal, Contient toutes les fonctionnalités et pages de l'app
│   ├── (main)/                 # Pages principales accessibles aux utilisateurs
│   │   ├── event/[id]/page.tsx          # Détail d’un événement spécifique
│   │   ├── legal-mentions/page.tsx      # Page des mentions légales
│   │   ├── login/page.tsx               # Page de connexion utilisateur
│   │   ├── register/page.tsx            # Page d'inscription utilisateur
│   │   ├── my-events/page.tsx           # Liste des événements de l'utilisateur connecté
│   │   ├── layout.tsx                   # Mise en page utilisateur
│   │   └── page.tsx                     # Page d’accueil
│   ├── admin/(admin)/                # Pages et composants réservés à l’administration
│   │   ├── manage-events/page.tsx        # Gestion des événements
│   │   ├── manage-users/page.tsx         # Gestion des utilisateurs
│   │   ├── manage-registrations/page.tsx # Gestion des inscriptions
│   │   ├── ui/                         # Composants UI spécifiques à l’admin
│   │   │   ├── admin-footer.tsx
│   │   │   └── admin-header.tsx
│   │   ├── icon.svg                   # Icône admin du site pour navigateurs
│   │   ├── layout.tsx                 # Mise en page admin
│   │   └── page.tsx                   # Page racine du module admin
│   ├── api/                  # Routes API pour interagir avec le backend
│   │   ├── admin/
│   │   |   ├── events/route.ts               # API pour les événements (admin)
│   │   |   ├── registrations/route.ts        # API pour les inscriptions (admin)
│   │   |   └── users/route.ts                # API pour les utilisateurs (admin)
│   │   ├── auth/
│   │   |   ├── [...nextauth]/route.ts        # API pour l’intégration NextAuth
│   │   |   ├── login/route.ts                # API de login
│   │   |   └── register/route.ts             # API d'inscription
│   │   ├── my-events/route.ts                # API pour récupérer les événements de l'utilisateur
│   │   ├── unregister-event/route.ts         # API pour se désinscrire d’un événement
│   │   └── upload/route.ts                   # API d’upload de fichiers
│   ├── lib/                  # Fonctions utilitaires réutilisables
│   │   ├── auth.ts                    # Fonctions liées à l’authentification
│   │   ├── data.ts                    # Accès aux données
│   │   ├── definitions.ts             # Définitions des types ou constantes
│   │   └── utils.ts                   # Fonctions diverses
│   ├── ui/                   # Composants d’interface utilisateur réutilisables
│   |   ├── confirmation-modal.tsx     # Fenêtre modale de confirmation
│   |   ├── contact-modal.tsx          # Fenêtre modale pour contact
│   |   ├── EventCard.tsx              # Carte affichant un événement
│   |   ├── footer.tsx                 # Pied de page
│   |   ├── header.tsx                 # En-tête
│   |   └── on-top-button.tsx          # Bouton de remontée en haut de page
|   ├── globals.css                # Styles globaux de l'application
|   ├── icon.svg                   # Icône du site pour navigateurs
|   ├── layout.tsx                 # Mise en page globale
│   └── providers.tsx              # Configuration des librairies globales (contextes)
├── .env.local                    # Variables d’environnement locales
├── package.json                  # Fichier de configuration des dépendances npm
├── tsconfig.json                 # Configuration TypeScript
├── next.config.js                # Paramètres de Next.js
├── .gitignore
├── LICENSE.md
└── README.md                     # Documentation du projet
```

---

### Installation

Suivez ces étapes pour démarrer le projet localement.

#### Prérequis

Assurez-vous d'avoir Node.js installé sur votre machine, plus de détails à la fin de ce README.

#### Étapes

- Clonez le dépôt :

git clone [https://github.com/Only-tech/eventribe-nextjs.git]

- Installez les dépendances :

npm install

ou

yarn install

- Démarrez le serveur de développement :

npm run dev

ou

yarn dev

- Ouvrez http://localhost:3000 dans votre navigateur pour voir l'application.

- Le projet fonctionne avec une base de donnée qui a été construite depuis eventribe php, et restauré à supabase.

---

### Auteur

Cédrick FEUMEGNE.

---

## Licence

Ce projet est sous licence.

Voir le fichier LICENSE (/LICENSE.md) pour plus de détails.

---

---

# Plus (Installation ----- Déploiement)

```
Pour initier le projet et création du dossier projet, entrer cette commande dans le terminal

npx create-next-app@latest waitlist-landing-page

L'outil `create-next-app` va vous poser quelques questions. Voici les réponses que je vous recommande pour ce projet :

- `Would you like to use TypeScript?` **Yes**
- `Would you like to use ESLint?` **Yes**
- `Would you like to use Tailwind CSS?` **Yes** (C'est crucial lorsque le code utilise Tailwind)
- `Would you like to use `src/` directory?` **Yes**
- `Would you like to use App Router?` **Yes** (Recommandé pour les nouveaux projets Next.js)
- `Would you like to customize the default import alias?` **No**

Laissez l'installation se terminer. Cela prendra quelques minutes car il télécharge toutes les dépendances nécessaires.
```

---

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
