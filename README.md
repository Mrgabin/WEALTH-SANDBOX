# 🏛️ Wealth Sandbox
> **Simulateur d'empire financier et criminel interconnecté**
> *(Économie P2P, Minage Crypto, Bourse en Temps Réel, Immobilier & Foncières, Casino clandestin, Système de Fiscalité)*

[![React](https://img.shields.io/badge/React-19.0-blue?logo=react&logoColor=white&style=flat-square)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?logo=tailwind-css&logoColor=white&style=flat-square)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&logoColor=white&style=flat-square)](https://firebase.google.com)

---

## 🛠️ Comment a été réalisé le site ?

**Wealth Sandbox** a été conçu comme une application web moderne de type **Single Page Application (SPA)** ultra-performante, reposant sur un couplage technologique de pointe :

1. **Framework & Langage :** **React 19** et **TypeScript 5.8**. L'utilisation de TypeScript garantit une rigueur mathématique et une sécurité totale sur la gestion des flux monétaires, du minage de cryptomonnaies et des transactions d'actifs.
2. **Moteur de Rendu & Build :** **Vite 6**. Le serveur de développement ultra-rapide permet un rechargement instantané des modules pour une itération fluide.
3. **Design & Styles :** **Tailwind CSS v4.0** avec intégration native via `@tailwindcss/vite`. Toute l'interface graphique utilise une palette sombre cyber-neon sur-mesure (combinaisons d'anthracite profond `#09090E`, de bleus électriques, de touches d'ambre pour le prestige et de vert pour la finance).
4. **Animations :** **Motion (anciennement Framer Motion)** pour des transitions fluides lors des changements d'onglets, de l'achat d'actifs ou de l'ouverture de boîtes mystères.
5. **Base de Données & Persistance :** **Firebase Firestore** et **Local Storage** agissant en synergie. Les données de progression du joueur, de l'empire et de la trésorerie sont synchronisées de manière résiliente.

---

## 💰 Quel était le coût de départ ?

Le coût d'investissement de départ de ce projet est de **0 € (Zéro Euro)**. 

Le site a été entièrement réalisé à partir de technologies **open-source** et de services disposant de niveaux d'utilisation gratuits (*Free Tiers*) généreux :
* **Développement :** Local et conteneurisé (aucun frais de licence d'IDE ou de compilateur).
* **Base de données (Firebase) :** Utilisation du forfait gratuit *Spark* de Firebase (largement suffisant pour plusieurs milliers de lectures/écritures quotidiennes de données de jeu).
* **Hébergement :** Prêt pour un déploiement gratuit sur des plateformes comme Cloud Run, Vercel ou Netlify.
* **Librairies d'icônes & polices :** Lucide React (gratuite et open-source) et polices système haut de gamme sans coût d'acquisition.

---

## 📈 Les étapes de développement pour arriver à ce niveau de détail

Pour construire cette simulation ultra-complète, nous avons suivi une approche modulaire en **5 grandes étapes clés** :

### 🚀 Étape 1 : Fondations & Moteur Temporel (Tick Engine)
* Création de l'architecture de données TypeScript (`src/types/wealth.ts`) définissant l'état du joueur, ses compétences de minage, ses portefeuilles d'actions, de cryptomonnaies et ses actifs physiques.
* Mise en place de la boucle de rafraîchissement temporelle (toutes les secondes) gérant les revenus passifs, la consommation d'électricité des serveurs et l'évolution des cours de la Bourse.

### 💻 Étape 2 : Minage de Cryptomonnaies & Trading Actif
* Implémentation d'un module de minage de Bitcoin et d'Ethereum réaliste : gestion du taux de hachage (*Hashrate*), de la consommation d'énergie (Watts), de la température des cartes graphiques et du coût de l'électricité locale.
* Création d'une Bourse dynamique avec graphiques d'historique de cours (générés dynamiquement) simulant des fluctuations de marché réalistes (avec des événements de hausse ou de krach).

### 🏛️ Étape 3 : Module Immobilier & Gestion des Réseaux d'Agences
* Conception de l'immobilier d'entreprise et commercial.
* **Ajout de réseaux d'agences réels et détaillés :**
  * *Réseaux physiques traditionnels :* ORPI, Century 21, Laforêt, Guy Hoquet, ERA, Nestenn, Stéphane Plaza.
  * *Gestionnaires de copropriété & de parcs :* Foncia, Citya, Nexity.
  * *Mandataires 100% digitaux :* IAD France, Safti, Capifrance.
  * *Agences de Luxe & Prestige :* Barnes, Sotheby's, Engel & Völkers.
  * *Sociétés Foncières & Centres Commerciaux (SIIC) :* URW (Unibail), Klepierre, Gecina, Covivio, Mercialys.
  * *Acteurs Logistiques :* Argan, Prologis.
  * *SCPI de rendement (Pierre-Papier) :* Corum L'Épargne, Sofidy, La Française REM, Amundi & Primonial.
* Intégration d'un **système de filtres de catégories interactif** pour trier instantanément les opportunités d'achat.

### ⌚ Étape 4 : Marché de Prestige & Collection Rolex Officielle
* Création d'un marketplace de prestige où l'achat d'objets rares augmente les points de standing du joueur.
* **Intégration d'un catalogue officiel d'horlogerie Rolex** avec les prix conseillés (MSRP) et des descriptions méticuleuses (Submariner Starbucks, Daytona Platine cadran bleu glacier, GMT-Master II Pepsi/Batman, Day-Date présidentielle, Perpetual 1908...).

### ✨ Étape 5 : Polissage de l'Interface (UI/UX) & Sécurité
* Implémentation d'un tableau de bord moderne combinant l'affichage des KPI principaux (Solde net, Liquidités, Revenus passifs/sec, Consommation électrique totale).
* Validation complète des types TS et élimination des erreurs de build pour garantir une exécution parfaite.

---

## 🖼️ Aperçu du Site (Previews)

*Voici à quoi ressemble l'interface moderne et immersive de Wealth Sandbox :*

### 1. Tableau de Bord Général (Dashboard)
> Un centre de contrôle futuriste qui récapitule vos revenus passifs, vos indicateurs clés de performance et votre réputation dans le monde des affaires.
> 
> ![Tableau de bord de gestion financière](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80)

### 🏛️ 2. Le Marché de l'Immobilier & des SCPI
> Explorez, filtrez et achetez des agences, des centres commerciaux géants (URW, Gecina) ou investissez en parts de SCPI pour générer des loyers automatiques récurrents.
> 
> ![Gestion immobilière et gratte-ciels](https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1000&q=80)

### ⌚ 3. Le Marché de Prestige & d'Horlogerie Fine
> Convertissez vos gains en objets de collection d'exception. Achetez les modèles Rolex officiels les plus recherchés au monde pour propulser vos points de Prestige.
> 
> ![Horlogerie de luxe gros plan](https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1000&q=80)

---

## ⚙️ Comment lancer le projet en local ?

### Prérequis
* [Node.js](https://nodejs.org/) (Version 18 ou supérieure recommandée)
* npm, yarn ou bun

### Installation

1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/votre-compte/wealth-sandbox.git
   cd wealth-sandbox
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

3. **Lancer le serveur de développement :**
   ```bash
   npm run dev
   ```
   *L'application sera accessible localement à l'adresse [http://localhost:3000](http://localhost:3000)*

4. **Compiler le projet pour la production :**
   ```bash
   npm run build
   ```
   *Les fichiers statiques optimisés seront générés dans le dossier `/dist`.*
