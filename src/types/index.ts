export type Role = 'enseignant' | 'admin';

export interface User {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  role: Role;
}

export interface Filiere {
  id: string;
  nom: string;
}

export type JourSemaine = 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi';

export interface Creneau {
  id: string;
  jour_semaine: JourSemaine;
  heure_debut: string;
  heure_fin: string;
}

export interface Reservation {
  id: string;
  utilisateur_id: string;
  filiere_id: string;
  creneau_id: string;
  date: string; // Format YYYY-MM-DD
  titre_module: string;
  description: string;
  axe_pedagogique?: string; // Nouvel attribut pour l'axe pédagogique
  salle?: string;
}

export type StatutCreneau = 'disponible' | 'reserve' | 'passe';

export interface CreneauAffichage extends Creneau {
  statut: StatutCreneau;
  reservation?: Reservation;
  filiere?: Filiere;
  utilisateur?: User;
}
