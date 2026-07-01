# AfricaScout — Spécification technique pour Claude Code

## Contexte du projet

AfricaScout est une marketplace biface de scouting football africain — le "LinkedIn du football africain". Elle connecte les joueurs amateurs africains qui veulent être découverts aux scouts/recruteurs/académies qui cherchent des talents.

Le projet part de zéro : seul un dossier vide existe pour l'instant. Le développeur a déjà :
- Un compte PostgreSQL fonctionnel sur un VPS distant (connexion testée et validée via pgAdmin)
- Une base de données dédiée nommée `africascout` sur ce serveur
- Pas encore de compte Clerk ni Cloudinary créés (à faire)

## Stack technique imposée

- **Frontend** : Next.js 14+ (App Router), TypeScript, Tailwind CSS et framer motion ou gsap avec des librairies pour les icones, des animations fluides premium le tout optimiser style des meilleurs sur dribbbles ou behance
- **Backend** : Next.js API Routes / Route Handlers (pas de serveur séparé)
- **ORM** : Prisma
- **Base de données** : PostgreSQL auto-hébergé sur VPS distant (PAS Supabase — c'est un changement volontaire par rapport au PRD original qui prévoyait Supabase)
- **Authentification** : Clerk (gère inscription, connexion, sessions, OAuth)
- **Stockage médias (images/vidéos)** : Cloudinary
- **Temps réel (messagerie)** : Socket.io
- **Validation des données** : Zod
- **Déploiement cible** : Vercel

## Connexion base de données

```
DATABASE_URL="postgresql://postgres:<MOT_DE_PASSE>@167.86.80.169:8432/africascout"
```

Cette variable doit être placée dans `.env` (jamais commitée dans git — vérifier que `.env` est dans `.gitignore`).

## Modèle de données

Architecture hybride validée : une table `User` commune pour l'authentification et les infos partagées, avec des tables de profil spécifiques liées en relation 1-to-1 selon le rôle. C'est le pattern utilisé par les marketplaces bifaces en production (évite la duplication, reste extensible).

### Table `User` (commune à tous les rôles)
| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY | Identifiant unique (lié à l'ID Clerk) |
| clerkId | String | UNIQUE NOT NULL | ID utilisateur fourni par Clerk |
| email | String | UNIQUE NOT NULL | Email de connexion |
| role | Enum | NOT NULL | `PLAYER` / `SCOUT` / `ACADEMY` / `AGENT` |
| fullName | String | NOT NULL | Nom complet affiché |
| avatarUrl | String | NULLABLE | URL Cloudinary de l'avatar |
| isVerified | Boolean | DEFAULT false | Vérification manuelle (académies notamment) |
| subscriptionTier | Enum | DEFAULT FREE | `FREE` / `PRO_SCOUT` / `ELITE_ACADEMY` |
| createdAt | DateTime | DEFAULT now() | Date de création du compte |
| updatedAt | DateTime | auto | Date de dernière modification |

### Table `PlayerProfile` (liée à User, role = PLAYER)
| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY | |
| userId | UUID | FK → User.id, UNIQUE | Relation 1-to-1 |
| age | Int | NOT NULL | Âge actuel du joueur |
| position | Enum | NOT NULL | GK, CB, LB, RB, CM, AM, LW, RW, ST |
| country | String(2) | NOT NULL | Code ISO du pays (ex: SN, GH, MA) |
| club | String | NULLABLE | Club ou académie actuelle |
| bio | String | NULLABLE | Description libre du joueur |
| stats | Json | DEFAULT {} | `{goals, assists, matches, minutes}` |
| attributes | Json | DEFAULT {} | `{speed, technique, physical, mental}` (0-100 chacun) |
| rating | Float | CALCULÉ | Score composite — voir formule ci-dessous |
| academyId | UUID | FK → Academy.id, NULLABLE | Si rattaché à une académie partenaire |

### Table `ScoutProfile` (liée à User, role = SCOUT ou AGENT)
| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY | |
| userId | UUID | FK → User.id, UNIQUE | |
| organization | String | NULLABLE | Club ou agence représentée |
| searchRegion | String | NULLABLE | Zone de recherche prioritaire |

### Table `Academy` (liée à User, role = ACADEMY)
| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY | |
| userId | UUID | FK → User.id, UNIQUE | |
| name | String | NOT NULL | Nom de l'académie |
| country | String(2) | NOT NULL | |
| verifiedAt | DateTime | NULLABLE | Date de vérification badge officiel |
| playerCount | Int | DEFAULT 0 | Nombre de joueurs en formation |
| foundedYear | Int | NULLABLE | |

### Table `Video`
| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY | |
| playerId | UUID | FK → PlayerProfile.id | |
| cloudinaryUrl | String | NOT NULL | |
| title | String | NOT NULL | |
| views | Int | DEFAULT 0 | |
| likes | Int | DEFAULT 0 | |
| durationSec | Int | NULLABLE | |
| createdAt | DateTime | DEFAULT now() | |

### Table `Message`
| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY | |
| fromUserId | UUID | FK → User.id | |
| toUserId | UUID | FK → User.id | |
| content | String | NOT NULL | |
| readAt | DateTime | NULLABLE | |
| createdAt | DateTime | DEFAULT now() | |

### Table `ScoutRating`
| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY | |
| scoutId | UUID | FK → User.id | Doit avoir subscriptionTier PRO_SCOUT ou ELITE_ACADEMY |
| playerId | UUID | FK → PlayerProfile.id | |
| score | Int | NOT NULL | Note de 1 à 10 |
| comment | String | NULLABLE | Commentaire privé du scout |
| createdAt | DateTime | DEFAULT now() | |

### Formule de calcul du score composite joueur (`rating`, 0-100)

À recalculer automatiquement à chaque mise à jour des données sources (via trigger DB ou job applicatif) :

- **40%** — Statistiques saison (buts, passes, matchs) — saisie manuelle joueur/académie
- **30%** — Attributs physiques (vitesse, technique, physique, mental) — auto-évaluation + ratings scouts
- **20%** — Notes scouts (moyenne des scores 1-10) — uniquement scouts Pro/Elite
- **10%** — Engagement feed (vues, likes vidéos) — calculé automatiquement

## Fonctionnalités MVP (par ordre de priorité)

### 🔴 P0 — Indispensable (à livrer en premier)

**Authentification & Onboarding**
- Inscription/connexion via Clerk (email + OAuth Google)
- Onboarding en 3 étapes avec sélection du rôle (joueur / scout / académie / agent)
- Création automatique du `User` + profil spécifique (`PlayerProfile`/`ScoutProfile`/`Academy`) à l'inscription

**Profil joueur**
- Création de profil : nom, âge, poste, pays, club, bio
- Upload photo/avatar via Cloudinary
- Saisie statistiques saison (buts, passes, matchs, minutes jouées)
- Upload vidéos highlights — max 3 vidéos en plan Free, illimité en Pro/Elite — compression automatique Cloudinary

**Recherche & découverte (côté scout)**
- Recherche texte libre (nom, académie, club)
- Filtre par poste (8 postes : GK, CB, LB, RB, CM, AM, LW, RW, ST)
- Filtre par pays (54 pays africains + diaspora)
- Filtre par tranche d'âge (≤18 / 19-21 / 22-25 / 25+)
- Limite 10 recherches/jour en Free, illimité en Pro/Elite

**Feed & engagement**
- Feed d'activité chronologique (nouvelles vidéos, mises à jour profil)
- Likes et compteur de vues sur chaque publication
- Messagerie privée scout ↔ joueur/académie (Socket.io pour le temps réel)

### 🟡 P1 — Important (deuxième vague)

- Attributs physiques détaillés (vitesse, technique, physique, mental — notation 1-100)
- Tri des résultats de recherche par note globale (rating composite)
- Badge "académie vérifiée" avec priorité dans les résultats de recherche
- Notifications (message reçu, profil consulté)

### 🟢 P2 — Reporté en V2 (ne pas développer maintenant, mais garder le modèle de données compatible)

- Résumé IA automatique du profil joueur (3 lignes, via Claude API)
- Algorithme de recommandation de feed personnalisé
- Paiements Stripe pour les abonnements Pro Scout / Elite Academy
- Application mobile React Native
- Analyse vidéo IA (détection automatique de buts, passes, dribbles)

## Modèle économique (pour référence — pas à implémenter en P0)

| | Free | Pro Scout — 29€/mois | Elite Academy — 89€/mois |
|---|---|---|---|
| Profil joueur | Basique | Complet | Multi-joueurs |
| Vidéos highlights | 3 max | Illimitées | Illimitées |
| Recherche | 10/jour | Illimitée | Illimitée + API |
| Filtres avancés | Non | Oui | Oui |
| Messagerie | Non | Directe | Prioritaire |
| Badge vérification | Non | Non | Oui |

## Contraintes techniques spécifiques

**Optimisation faible connectivité (marché africain, priorité produit)**
- Lazy loading systématique des images et vidéos (chargées uniquement au scroll)
- Images servies en WebP via Cloudinary avec breakpoints responsive
- Pagination infinie côté serveur, 10 résultats maximum par requête
- PWA offline-first : profils déjà consultés mis en cache, feed disponible hors connexion (prévoir dès l'architecture même si l'implémentation complète peut être en P1)

**Sécurité des données**
- Chaque utilisateur ne doit pouvoir modifier que ses propres données (vérification de propriété au niveau des API routes, puisqu'on n'a pas le Row-Level Security natif de Supabase — cette vérification doit être faite manuellement dans chaque handler)
- Validation stricte de toutes les entrées utilisateur via Zod avant toute écriture en base
- Variables sensibles (DATABASE_URL, clés Clerk, clés Cloudinary) uniquement en variables d'environnement, jamais en dur dans le code

## Ce qui doit être livré en premier (ordre suggéré pour Claude Code)

1. Initialisation du projet Next.js (TypeScript, Tailwind, App Router) — si pas déjà fait
2. Installation et configuration de Prisma, connexion à la base PostgreSQL distante
3. Écriture du schéma Prisma complet (`schema.prisma`) selon le modèle de données ci-dessus
4. Première migration (`npx prisma migrate dev`) pour créer les tables sur le VPS
5. Intégration de Clerk (configuration, middleware d'authentification, pages de connexion/inscription)
6. Webhook Clerk → création automatique du `User` en base à l'inscription
7. Page d'onboarding 3 étapes avec sélection de rôle
8. CRUD profil joueur (création, édition) + upload Cloudinary pour avatar et vidéos
9. Page de recherche avec filtres (poste, pays, âge) côté scout
10. Feed d'activité basique (sans algorithme de recommandation — juste chronologique)
11. Messagerie privée avec Socket.io

## Notes pour Claude Code

- Le développeur n'a encore créé aucun fichier de code, seulement un dossier vide — démarrer depuis zéro
- Le développeur est étudiant en apprentissage du genie logiciel et administration reseau — privilégier des explications claires et un code commenté quand c'est pertinent, surtout pour les concepts non triviaux (relations Prisma, middleware Next.js, webhooks Clerk)
- Toujours vérifier que les commandes et le code générés sont compatibles avec un environnement Windows (le développeur travaille sous Windows/PowerShell)
- Le compte Clerk et le compte Cloudinary ne sont pas encore créés — le développeur devra les créer (gratuit) et fournir les clés API avant que ces intégrations puissent être testées