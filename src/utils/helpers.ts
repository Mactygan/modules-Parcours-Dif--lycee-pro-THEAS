import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// Génération d'ID unique
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Formatage des dates
export const formatDate = (date: Date | string, formatStr: string = 'dd/MM/yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: fr });
};

export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

// Calculs pour les notes
export const calculerMoyenne = (notes: number[]): number => {
  if (notes.length === 0) return 0;
  const sum = notes.reduce((acc, note) => acc + note, 0);
  return Math.round((sum / notes.length) * 100) / 100;
};

export const calculerMoyennePonderee = (
  evaluations: Array<{ note: number; coefficient: number }>
): number => {
  if (evaluations.length === 0) return 0;
  const sumNotes = evaluations.reduce((acc, e) => acc + e.note * e.coefficient, 0);
  const sumCoef = evaluations.reduce((acc, e) => acc + e.coefficient, 0);
  return Math.round((sumNotes / sumCoef) * 100) / 100;
};

// Calcul de la progression
export const calculerProgression = (total: number, complete: number): number => {
  if (total === 0) return 0;
  return Math.round((complete / total) * 100);
};

// Validation des emails
export const validerEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validation des téléphones français
export const validerTelephone = (telephone: string): boolean => {
  const regex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return regex.test(telephone);
};

// Formatage du niveau
export const formatNiveau = (niveau: 'CAP' | 'BAC_PRO' | 'BTS'): string => {
  const niveaux: Record<string, string> = {
    CAP: 'CAP',
    BAC_PRO: 'Bac Pro',
    BTS: 'BTS',
  };
  return niveaux[niveau] || niveau;
};

// Formatage du statut
export const formatStatut = (
  statut: 'non_commence' | 'en_cours' | 'termine' | 'valide' | 'planifie' | 'annule'
): string => {
  const statuts: Record<string, string> = {
    non_commence: 'Non commencé',
    en_cours: 'En cours',
    termine: 'Terminé',
    valide: 'Validé',
    planifie: 'Planifié',
    annule: 'Annulé',
  };
  return statuts[statut] || statut;
};

// Couleur du statut
export const getStatutColor = (
  statut: 'non_commence' | 'en_cours' | 'termine' | 'valide' | 'planifie' | 'annule'
): string => {
  const colors: Record<string, string> = {
    non_commence: 'bg-gray-100 text-gray-800',
    en_cours: 'bg-blue-100 text-blue-800',
    termine: 'bg-green-100 text-green-800',
    valide: 'bg-emerald-100 text-emerald-800',
    planifie: 'bg-yellow-100 text-yellow-800',
    annule: 'bg-red-100 text-red-800',
  };
  return colors[statut] || 'bg-gray-100 text-gray-800';
};

// Filtrage et recherche
export const rechercherDansTexte = (texte: string, recherche: string): boolean => {
  if (!recherche) return true;
  return texte.toLowerCase().includes(recherche.toLowerCase());
};

// Tri
export const trierParDate = <T extends { createdAt: Date }>(items: T[], ordre: 'asc' | 'desc' = 'desc'): T[] => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return ordre === 'asc' ? dateA - dateB : dateB - dateA;
  });
};

// Export CSV
export const exporterCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',')
          ? `"${value}"`
          : value;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
