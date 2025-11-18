import { Module, Programme, Eleve, Classe, SeanceCours, ProgressionEleve, Evaluation } from '../types';
import { generateId } from './helpers';

// Données de démonstration pour les modules
export const mockModules: Module[] = [
  {
    id: generateId(),
    code: 'MOD-001',
    titre: 'Introduction à la programmation',
    description: 'Apprentissage des bases de la programmation avec Python',
    dureeHeures: 40,
    niveau: 'BAC_PRO',
    competences: ['Variables et types', 'Structures de contrôle', 'Fonctions', 'Debugging'],
    prerequis: ['Mathématiques de base', 'Logique'],
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-01'),
  },
  {
    id: generateId(),
    code: 'MOD-002',
    titre: 'Électricité industrielle',
    description: 'Étude des circuits électriques et automatismes industriels',
    dureeHeures: 60,
    niveau: 'CAP',
    competences: ['Loi d\'Ohm', 'Circuits série/parallèle', 'Sécurité électrique', 'Schémas électriques'],
    prerequis: ['Physique de base'],
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-01'),
  },
  {
    id: generateId(),
    code: 'MOD-003',
    titre: 'Gestion de projet',
    description: 'Méthodologies de gestion de projet en entreprise',
    dureeHeures: 35,
    niveau: 'BTS',
    competences: ['Planning', 'Gestion des risques', 'Communication', 'Outils collaboratifs'],
    prerequis: ['Organisation du travail'],
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-01'),
  },
];

// Données de démonstration pour les classes
export const mockClasses: Classe[] = [
  {
    id: generateId(),
    nom: 'CAP ELEC 1A',
    niveau: 'CAP',
    annee: 1,
    programmeId: '',
    effectif: 18,
    eleveIds: [],
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-01'),
  },
  {
    id: generateId(),
    nom: 'BAC PRO SN 2A',
    niveau: 'BAC_PRO',
    annee: 2,
    programmeId: '',
    effectif: 24,
    eleveIds: [],
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-01'),
  },
  {
    id: generateId(),
    nom: 'BTS SIO 1A',
    niveau: 'BTS',
    annee: 1,
    programmeId: '',
    effectif: 30,
    eleveIds: [],
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-01'),
  },
];

// Données de démonstration pour les programmes
export const mockProgrammes: Programme[] = [
  {
    id: generateId(),
    nom: 'Programme CAP Électricien',
    description: 'Formation complète pour le CAP Électricien',
    niveau: 'CAP',
    annee: 2024,
    modules: [mockModules[1].id],
    objectifs: [
      'Maîtriser les bases de l\'électricité',
      'Réaliser des installations électriques',
      'Respecter les normes de sécurité',
    ],
    dureeTotal: 840,
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-01'),
  },
  {
    id: generateId(),
    nom: 'Programme Bac Pro SN',
    description: 'Systèmes Numériques - Bac Professionnel',
    niveau: 'BAC_PRO',
    annee: 2024,
    modules: [mockModules[0].id],
    objectifs: [
      'Développer des compétences en programmation',
      'Maîtriser les systèmes numériques',
      'Travailler en équipe sur des projets',
    ],
    dureeTotal: 1200,
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-01'),
  },
];

// Données de démonstration pour les élèves
export const mockEleves: Eleve[] = [
  {
    id: generateId(),
    nom: 'Dupont',
    prenom: 'Jean',
    dateNaissance: new Date('2006-05-15'),
    email: 'jean.dupont@lycee.fr',
    telephone: '0612345678',
    classe: mockClasses[0].nom,
    niveau: 'CAP',
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-01'),
  },
  {
    id: generateId(),
    nom: 'Martin',
    prenom: 'Sophie',
    dateNaissance: new Date('2005-08-22'),
    email: 'sophie.martin@lycee.fr',
    telephone: '0623456789',
    classe: mockClasses[1].nom,
    niveau: 'BAC_PRO',
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-01'),
  },
  {
    id: generateId(),
    nom: 'Bernard',
    prenom: 'Lucas',
    dateNaissance: new Date('2004-12-10'),
    email: 'lucas.bernard@lycee.fr',
    telephone: '0634567890',
    classe: mockClasses[2].nom,
    niveau: 'BTS',
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-01'),
  },
];

// Données de démonstration pour les séances
export const mockSeances: SeanceCours[] = [
  {
    id: generateId(),
    moduleId: mockModules[0].id,
    titre: 'Introduction Python - Variables',
    description: 'Première séance sur les variables et types de données',
    dateDebut: new Date('2024-11-20T08:00:00'),
    dateFin: new Date('2024-11-20T10:00:00'),
    salle: 'B201',
    enseignant: 'M. Durand',
    classeId: mockClasses[1].id,
    type: 'cours',
    ressources: ['support_cours.pdf', 'exercices.pdf'],
    statut: 'planifie',
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-11-15'),
  },
  {
    id: generateId(),
    moduleId: mockModules[1].id,
    titre: 'TP Électricité - Circuits série',
    description: 'Travaux pratiques sur les circuits série',
    dateDebut: new Date('2024-11-21T14:00:00'),
    dateFin: new Date('2024-11-21T17:00:00'),
    salle: 'Atelier A',
    enseignant: 'M. Leblanc',
    classeId: mockClasses[0].id,
    type: 'tp',
    ressources: ['fiche_tp.pdf'],
    statut: 'planifie',
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-11-15'),
  },
];

// Données de démonstration pour les progressions
export const mockProgressions: ProgressionEleve[] = [
  {
    id: generateId(),
    eleveId: mockEleves[1].id,
    moduleId: mockModules[0].id,
    statut: 'en_cours',
    dateDebut: new Date('2024-09-15'),
    competencesValidees: ['Variables et types', 'Structures de contrôle'],
    createdAt: new Date('2024-09-15'),
    updatedAt: new Date('2024-11-18'),
  },
  {
    id: generateId(),
    eleveId: mockEleves[0].id,
    moduleId: mockModules[1].id,
    statut: 'en_cours',
    dateDebut: new Date('2024-09-15'),
    competencesValidees: ['Loi d\'Ohm'],
    createdAt: new Date('2024-09-15'),
    updatedAt: new Date('2024-11-18'),
  },
];

// Données de démonstration pour les évaluations
export const mockEvaluations: Evaluation[] = [
  {
    id: generateId(),
    eleveId: mockEleves[1].id,
    moduleId: mockModules[0].id,
    type: 'controle_continu',
    note: 15.5,
    coefficient: 1,
    date: new Date('2024-10-15'),
    commentaire: 'Bonne compréhension des concepts de base',
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-10-15'),
  },
  {
    id: generateId(),
    eleveId: mockEleves[0].id,
    moduleId: mockModules[1].id,
    type: 'tp',
    note: 14,
    coefficient: 2,
    date: new Date('2024-10-20'),
    commentaire: 'Manipulation correcte, attention aux mesures',
    createdAt: new Date('2024-10-20'),
    updatedAt: new Date('2024-10-20'),
  },
];
