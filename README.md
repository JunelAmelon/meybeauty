# Bible du Projet Mey Beauty

> **Objectif de ce document** : Fournir une compréhension totale et exhaustive du Projet Mey Beauty (architecture, base de données, logique métier) sans avoir besoin d'ouvrir le code source.

---

## 🏗️ Architecture Globale

Le projet est un **Monolithe Modulaire** basé sur le framework **Next.js 16+ (App Router)**.
Il héberge deux applications distinctes au sein du même codebase :

1.  **Mey Beauty Retail (B2C)** : La boutique e-commerce grand public.
2.  **Mey Beauty Pro (B2B)** : L'espace revendeur pour les professionnels (instituts, spas).

### Technologies Clés
*   **Frontend** : Next.js (React), Tailwind CSS, Radix UI.
*   **Backend / DB** : Firebase (Authentication & Firestore NoSQL).
*   **Langage** : TypeScript (strict).
*   **Internationalisation** : `next-intl` (Français, Espagnol PE, Anglais).

### Structure des Dossiers ("Où trouver quoi ?")

*   `apps/b2c` : Code source de la boutique (pages, composants UI, hooks B2C).
*   `apps/b2b` : Code source de l'espace pro (pages "livrables", hooks B2B, contextes auth spécifiques).
*   `src/app` : Le routeur principal de Next.js.
    *   `/` : Charge la page d'accueil B2C.
    *   `/pro` : Route protégée qui charge les pages de `apps/b2b`.
*   `src/public/locales` : Fichiers JSON contenant TOUS les textes (traductions).
*   `packages/firebase` : Configuration partagée de la connexion à la base de données.

---

## 🗄️ Modèle de Données (Base de Données Firestore)

L'application utilise **Firestore**. Les données sont organisées en **Collections** (tables) contenant des **Documents** (lignes).
Voici la structure exacte de chaque collection.

### 1. 🛍️ Catalogue & Contenu

#### `products` (Produits B2C)
Catalogue principal visible sur le site public.
*   `slug` (ID) : Chaîne unique (ex: "huile-jojoba").
*   `category` : Catégorie du produit (ex: "Soins du visage").
*   `price` : Prix public TTC (Number).
*   `image` : URL de l'image principale.
*   `translations` (Map) : Contenu traduit.
    *   `fr`, `en`, `es-PE` :
        *   `name` : Nom du produit.
        *   `desc` : Description courte.
        *   `long_desc` : Description détaillée.

#### `blogPosts` (Articles de Blog)
*   `slug` (ID), `image`, `date`, `readTime` (temps de lecture), `category`.
*   `author` : `{ name, role, avatar }`.
*   `related` : Liste de slugs d'articles liés.
*   `translations` : `{ title, excerpt, content[] }`.

#### `rituelsB2B` (Protocoles de Soin Pro)
Documentation technique pour les esthéticiennes.
*   `slug`, `reference`, `category`, `image`, `duration`.
*   `preparation` : Listes d'éléments nécessaires (`cabine`, `materiel`, `produits`).
*   `deroulement` : Étapes du soin. Liste d'objets :
    *   `{ phase, duree, description, actions[] }`
*   `translations` : Traduction de tous les textes ci-dessus.

#### `fichesTechniquesB2B` (Fiches Produits Pro)
Détails techniques des produits cabine.
*   `slug`, `reference`, `extraction` (méthode), `volume` (ex: 250ml).
*   `actifs` : Liste `{ nom, role }` (ingrédients clés).
*   `utilisation` : `{ frequence, methode, temps, retrait }`.
*   `translations` : Traduction intégrale.

#### `downloadsB2B` (Zone de Téléchargement)
Fichiers marketing pour les pros.
*   `slug`, `type` (image/pdf/video), `category` (PLV, Formation...), `url`, `size`.

---

### 2. 👥 Utilisateurs & Accès

#### `users` (Profils Utilisateurs)
Lié à l'authentification Firebase Auth via l'ID utilisateur (`uid`).
*   `email` : Adresse email.
*   `role` : 'b2c' (client) ou 'b2b' (pro).
*   `validated` (Boolean) : **CRITIQUE**. Si `false`, l'utilisateur Pro est bloqué sur une page d'attente.
*   `company` : Nom de l'entreprise.
*   `siret` : Numéro d'identification.
*   `prenom`, `nom`, `phone`, `address`, `city`, `postalCode`.
*   `remise` (Number) : Pourcentage de remise personnalisé (optionnel).
*   `kbisUrl`, `idUrl` : Documents justifiant l'activité pro.

---

### 3. 💰 Commerce (Commandes & Factures)

#### `orders` (Historique des Commandes)
Historique centralisé des achats.
*   `userId` : Lien vers la collection `users`.
*   `createdAt` : Date de commande.
*   `lines` : Contenu du panier. Liste d'objets `{ name, quantity, slug }`.
*   `status` : État de la commande.

#### `payments` / Factures
Utilisé pour générer les tableaux de bord financiers et les PDF.
*   `orderId` : Référence à la commande.
*   `invoiceNumber` : Numéro séquentiel unique.
*   `amountHT`, `amountTTC` : Montants financiers.
*   `currency` : Devise ('EUR' ou 'PEN').
*   `status` : 'payee', 'en_attente', 'retard'.
*   `date`, `dueDate` (échéance).
*   `pdfFranceUrl`, `pdfPeruUrl` : Liens vers les documents générés (Bucket Storage).
*   `buyer`, `seller` : Instantané des coordonnées au moment de la facturation (pour l'immutabilité comptable).

#### `reassortConfigsB2B` (Réassort Automatique)
Configuration pour les commandes récurrentes des pros.
*   `userId` : Le pro concerné.
*   `productSlug` : Produit à commander.
*   `frequency` : Périodicité (ex: "mensuel").
*   `quantity` : Quantité fixe.
*   `active` (Boolean) : État de la configuration.

---

## ⚙️ Logique Métier & Workflows

### 🔐 Authentification & Sécurité B2B
1.  **Inscription** : Le pro remplit un formulaire complet (SIRET, KBIS...).
2.  **Création** : Un compte `auth` est créé + un document `users` avec `role: 'b2b'` et `validated: false`.
3.  **ProGate** : À chaque chargement de page `/pro`, le système vérifie :
    *   Si l'user est connecté.
    *   Si son rôle est `b2b`.
    *   SI `validated` est `true`.
    *   *Sinon -> Redirection forcée vers `/pro/validation`.*

### 🛒 Règles Panier
*   **B2C** : Panier stocké dans le navigateur (`localStorage`). Pas de limite.
*   **B2B** :
    *   Panier stocké dans le navigateur (`localStorage`).
    *   **Minimum de commande** : 100 unités (ou règle spécifique selon config).
    *   **Commande Rapide** : Interface tableau pour saisie en masse. Vérifie le stock en temps réel avant validation.

### 🌍 Internationalisation (i18n)
*   La langue est détectée automatiquement ou choisie via le sélecteur.
*   Le contenu statique (boutons, menus) vient des fichiers JSON (`src/public/locales`).
*   Le contenu dynamique (produits, blog) est pioché dans le champ `translations` de la base de données selon la langue active (`fr`, `es-PE` ou `en`).
*   **Factures** : Le système génère dynamiquement des modèles différents selon la région (modèle FR avec TVA/SIRET vs modèle PE avec RUC/IGV).

---

## 🛠️ Commandes pour le Développeur

| Commande | Action | Description |
| :--- | :--- | :--- |
| `npm run dev` | Démarrer | Lance le site en local sur `http://localhost:3000`. |
| `npm run build` | Vérifier | Compile le projet. Si erreurs (rouges), **le déploiement échouera**. |
| `npm run lint` | Nettoyer | Analyse le code pour trouver les erreurs de style ou bugs potentiels. |

### Configuration (`.env.local`)
Ces clés sont **obligatoires** pour que le site fonctionne (connexion à Firebase).
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# ... (voir documentation technique pour la liste complète)
```
