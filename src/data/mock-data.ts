import { User, Filiere, Creneau, Reservation, JourSemaine } from '../types';

export const users: User[] = [
  {
    id: '1',
    prenom: 'Admin',
    nom: 'Biencinto',
    email: 'dir.adj.iftheas@gmail.com',
    role: 'admin',
  },
  {
    id: '2',
    prenom: 'Jean',
    nom: 'Dupont',
    email: 'jean.dupont@example.com',
    role: 'enseignant',
  },
  {
    id: '3',
    prenom: 'Marie',
    nom: 'Laurent',
    email: 'marie.laurent@example.com',
    role: 'enseignant',
  },
];

export const filieres: Filiere[] = [
  {
    id: '1',
    nom: 'Hôtellerie',
  },
  {
    id: '2',
    nom: 'Agora-MCVB',
  },
  {
    id: '3',
    nom: 'MCVA',
  },
];

// Créneaux standard
const creneauxStandard: Creneau[] = [];
let creneauId = 1;

const joursComplets: JourSemaine[] = ['Lundi', 'Mardi', 'Jeudi', 'Vendredi'];
const mercredi: JourSemaine = 'Mercredi';

const creneauxJourComplet = [
  { heure_debut: '08:00', heure_fin: '10:00' },
  { heure_debut: '10:00', heure_fin: '12:00' },
  { heure_debut: '13:00', heure_fin: '15:00' },
];

const creneauxMercredi = [
  { heure_debut: '08:00', heure_fin: '10:00' },
  { heure_debut: '10:00', heure_fin: '12:00' },
];

// Générer les créneaux pour les jours complets
joursComplets.forEach(jour => {
  creneauxJourComplet.forEach(horaire => {
    creneauxStandard.push({
      id: String(creneauId++),
      jour_semaine: jour,
      heure_debut: horaire.heure_debut,
      heure_fin: horaire.heure_fin,
    });
  });
});

// Générer les créneaux pour le mercredi
creneauxMercredi.forEach(horaire => {
  creneauxStandard.push({
    id: String(creneauId++),
    jour_semaine: mercredi,
    heure_debut: horaire.heure_debut,
    heure_fin: horaire.heure_fin,
  });
});

export const creneaux: Creneau[] = creneauxStandard;

// Quelques exemples de réservations
export const reservations: Reservation[] = [
  {
    id: '1',
    utilisateur_id: '2',
    filiere_id: '1',
    creneau_id: '1', // Lundi 8h-10h
    date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0], // Date dans une semaine
    titre_module: 'Introduction à la cuisine française',
    description: 'Module d\'initiation aux bases de la cuisine française traditionnelle',
    salle: 'Salle 101',
  },
  {
    id: '2',
    utilisateur_id: '3',
    filiere_id: '2',
    creneau_id: '5', // Mardi 8h-10h
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], // Date demain
    titre_module: 'Communication professionnelle',
    description: 'Techniques de communication en milieu professionnel',
    salle: 'Salle 202',
  },
];
