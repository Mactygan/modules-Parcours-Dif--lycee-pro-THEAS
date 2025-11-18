# GestModule - Application de gestion des modules de formation

Application LMS (Learning Management System) complète pour la gestion des modules de formation dans un lycée professionnel.

## Fonctionnalités

### 1. Gestion des Modules de Formation
- Création, modification et suppression de modules
- Définition des compétences et prérequis
- Filtrage par niveau (CAP, Bac Pro, BTS)
- Recherche de modules

### 2. Gestion des Programmes Pédagogiques
- Création de programmes par niveau
- Association de modules aux programmes
- Définition des objectifs pédagogiques
- Suivi de la durée totale

### 3. Suivi des Élèves
- Gestion du dossier élève complet
- Suivi de la progression par module
- Historique des évaluations
- Calcul automatique des moyennes
- Visualisation des compétences validées

### 4. Gestion des Plannings
- Planification des séances de cours
- Support de différents types (cours, TP, TD, examen, projet)
- Attribution des salles et enseignants
- Gestion des ressources pédagogiques
- Filtrage par classe et type

## Technologies utilisées

- **Frontend**: React 18 avec TypeScript
- **État**: Zustand pour la gestion d'état globale
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build**: Vite
- **Dates**: date-fns

## Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build pour la production
npm run build

# Prévisualiser le build
npm run preview
```

## Structure du projet

```
src/
├── components/          # Composants React
│   ├── common/         # Composants réutilisables
│   ├── modules/        # Gestion des modules
│   ├── programmes/     # Gestion des programmes
│   ├── eleves/         # Gestion des élèves
│   └── plannings/      # Gestion des plannings
├── pages/              # Pages de l'application
├── services/           # Store Zustand
├── types/              # Définitions TypeScript
└── utils/              # Fonctions utilitaires
```

## Utilisation

L'application démarre avec des données de démonstration pour faciliter la prise en main.

### Navigation

- **Accueil**: Vue d'ensemble avec statistiques
- **Modules**: Gestion des modules de formation
- **Programmes**: Gestion des programmes pédagogiques
- **Élèves**: Suivi des élèves et progressions
- **Planning**: Planification des séances

### Gestion des données

Toutes les données sont stockées en mémoire via Zustand. Pour une version production, il faudrait :
- Ajouter une API backend (Node.js/Express, Python/Flask, etc.)
- Intégrer une base de données (PostgreSQL, MySQL, MongoDB)
- Ajouter l'authentification et les rôles utilisateurs

## Développement futur

- Système d'authentification
- API REST pour la persistance des données
- Export de rapports (PDF, CSV)
- Notifications et rappels
- Gestion des absences
- Espace élève/parent
- Application mobile

## Licence

Projet éducatif - Lycée Professionnel
