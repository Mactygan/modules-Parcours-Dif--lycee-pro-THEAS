// Types pour les modules de formation
export interface Module {
  id: string;
  code: string;
  titre: string;
  description: string;
  dureeHeures: number;
  niveau: 'CAP' | 'BAC_PRO' | 'BTS';
  competences: string[];
  prerequis: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les programmes pédagogiques
export interface Programme {
  id: string;
  nom: string;
  description: string;
  niveau: 'CAP' | 'BAC_PRO' | 'BTS';
  annee: number;
  modules: string[]; // IDs des modules
  objectifs: string[];
  dureeTotal: number;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour le suivi des élèves
export interface Eleve {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: Date;
  email: string;
  telephone?: string;
  classe: string;
  niveau: 'CAP' | 'BAC_PRO' | 'BTS';
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressionEleve {
  id: string;
  eleveId: string;
  moduleId: string;
  statut: 'non_commence' | 'en_cours' | 'termine' | 'valide';
  noteObtenue?: number;
  dateDebut?: Date;
  dateFin?: Date;
  commentaires?: string;
  competencesValidees: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Evaluation {
  id: string;
  eleveId: string;
  moduleId: string;
  type: 'controle_continu' | 'examen' | 'projet' | 'oral';
  note: number;
  coefficient: number;
  date: Date;
  commentaire?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les plannings
export interface SeanceCours {
  id: string;
  moduleId: string;
  titre: string;
  description?: string;
  dateDebut: Date;
  dateFin: Date;
  salle: string;
  enseignant: string;
  classeId: string;
  type: 'cours' | 'tp' | 'td' | 'examen' | 'projet';
  ressources?: string[];
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
  createdAt: Date;
  updatedAt: Date;
}

export interface Classe {
  id: string;
  nom: string;
  niveau: 'CAP' | 'BAC_PRO' | 'BTS';
  annee: number;
  programmeId: string;
  effectif: number;
  eleveIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les statistiques
export interface StatistiquesModule {
  moduleId: string;
  nombreEleves: number;
  moyenneGenerale: number;
  tauxReussite: number;
  tauxAbandon: number;
}

export interface StatistiquesEleve {
  eleveId: string;
  nombreModulesInscrits: number;
  nombreModulesTermines: number;
  moyenneGenerale: number;
  progressionGlobale: number;
}

// Types pour les filtres et recherches
export interface FiltresModule {
  niveau?: 'CAP' | 'BAC_PRO' | 'BTS';
  recherche?: string;
  competences?: string[];
}

export interface FiltresEleve {
  classe?: string;
  niveau?: 'CAP' | 'BAC_PRO' | 'BTS';
  recherche?: string;
}

export interface FiltresSeance {
  dateDebut?: Date;
  dateFin?: Date;
  classeId?: string;
  moduleId?: string;
  type?: 'cours' | 'tp' | 'td' | 'examen' | 'projet';
}
