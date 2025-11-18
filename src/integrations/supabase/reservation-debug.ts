import { supabase } from './client';
import { Reservation } from '@/types';

// Fonction de test pour la création de réservation
export const testReservationCreation = async (reservationData: Partial<Reservation>) => {
  try {
    console.log('Test de création de réservation avec les données:', reservationData);

    // Vérifier que les champs obligatoires sont présents
    if (!reservationData.utilisateur_id) {
      return { success: false, error: 'ID utilisateur manquant' };
    }

    if (!reservationData.filiere_id) {
      return { success: false, error: 'ID filière manquant' };
    }

    if (!reservationData.creneau_id) {
      return { success: false, error: 'ID créneau manquant' };
    }

    if (!reservationData.date) {
      return { success: false, error: 'Date manquante' };
    }

    if (!reservationData.titre_module) {
      return { success: false, error: 'Titre du module manquant' };
    }

    if (!reservationData.description) {
      return { success: false, error: 'Description manquante' };
    }

    // Vérifier si l'utilisateur existe
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', reservationData.utilisateur_id)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        error: 'Utilisateur non trouvé',
        details: userError
      };
    }

    // Vérifier si la filière existe
    const { data: filiereData, error: filiereError } = await supabase
      .from('filieres')
      .select('*')
      .eq('id', reservationData.filiere_id)
      .single();

    if (filiereError || !filiereData) {
      return {
        success: false,
        error: 'Filière non trouvée',
        details: filiereError
      };
    }

    // Vérifier si le créneau existe
    const { data: creneauData, error: creneauError } = await supabase
      .from('creneaux')
      .select('*')
      .eq('id', reservationData.creneau_id)
      .single();

    if (creneauError || !creneauData) {
      return {
        success: false,
        error: 'Créneau non trouvé',
        details: creneauError
      };
    }

    // Vérifier si le créneau est déjà réservé à cette date POUR CETTE FILIÈRE
    const { data: existingReservation, error: reservationCheckError } = await supabase
      .from('reservations')
      .select('*')
      .eq('creneau_id', reservationData.creneau_id)
      .eq('date', reservationData.date)
      .eq('filiere_id', reservationData.filiere_id);

    if (reservationCheckError) {
      return {
        success: false,
        error: 'Erreur lors de la vérification des réservations existantes',
        details: reservationCheckError
      };
    }

    if (existingReservation && existingReservation.length > 0) {
      return {
        success: false,
        error: 'Ce créneau est déjà réservé à cette date',
        existingReservation
      };
    }

    // Créer la réservation
    const { data, error } = await supabase
      .from('reservations')
      .insert([reservationData])
      .select();

    if (error) {
      return {
        success: false,
        error: 'Erreur lors de la création de la réservation',
        details: error
      };
    }

    return {
      success: true,
      data,
      message: 'Réservation créée avec succès'
    };
  } catch (error) {
    console.error('Erreur dans testReservationCreation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
};

export const testReservationDeletion = async (reservationId: string, userId: string) => {
  try {
    console.log('Test de suppression de réservation avec ID:', reservationId, 'par utilisateur:', userId);

    // Vérifier que l'ID est valide
    if (!reservationId) {
      return { success: false, error: 'ID de réservation manquant' };
    }

    // Vérifier si l'ID utilisateur est fourni
    if (!userId) {
      return { success: false, error: 'ID utilisateur manquant' };
    }

    // Vérifier si la réservation existe et appartient à l'utilisateur
    const { data: existingReservation, error: checkError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reservationId)
      .single();

    if (checkError || !existingReservation) {
      return {
        success: false,
        error: 'Réservation non trouvée',
        details: checkError
      };
    }

    // Vérifier si l'utilisateur est le propriétaire de la réservation
    if (existingReservation.utilisateur_id !== userId) {
      return {
        success: false,
        error: 'Vous n\'êtes pas autorisé à supprimer cette réservation'
      };
    }

    // Supprimer la réservation
    const { error: deleteError } = await supabase
      .from('reservations')
      .delete()
      .eq('id', reservationId);

    if (deleteError) {
      return {
        success: false,
        error: 'Erreur lors de la suppression de la réservation',
        details: deleteError
      };
    }

    return {
      success: true,
      message: 'Réservation supprimée avec succès'
    };
  } catch (error) {
    console.error('Erreur dans testReservationDeletion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
};
