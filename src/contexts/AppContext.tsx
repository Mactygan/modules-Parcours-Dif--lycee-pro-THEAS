import React, { createContext, useContext, useState, useEffect } from 'react';
import { Filiere, Creneau, Reservation, CreneauAffichage, User, JourSemaine } from '../types';
import { filieres as mockFilieres, creneaux as mockCreneaux, users as mockUsers } from '../data/mock-data';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { testReservationCreation, testReservationDeletion } from '@/integrations/supabase/reservation-debug';

interface AppContextType {
  filieres: Filiere[];
  creneaux: Creneau[];
  reservations: Reservation[];
  users: User[];
  selectedFiliere: Filiere | null;
  selectedDate: Date;
  creneauxAffichage: CreneauAffichage[];
  currentUser: User | null;
  setSelectedFiliere: (filiere: Filiere | null) => void;
  setSelectedDate: (date: Date) => void;
  addReservation: (reservation: Omit<Reservation, 'id'>) => Promise<void>;
  updateReservation: (id: string, reservation: Partial<Reservation>) => Promise<void>;
  deleteReservation: (id: string) => Promise<boolean>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  getCreneauById: (id: string) => Creneau | undefined;
  getFiliereById: (id: string) => Filiere | undefined;
  getUserById: (id: string) => User | undefined;
  getReservationsForWeek: (date: Date, filiereId?: string) => Reservation[];
  getJourSemaineFromDate: (date: Date) => JourSemaine | null;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filieres, setFilieres] = useState<Filiere[]>(mockFilieres);
  const [creneaux, setCreneaux] = useState<Creneau[]>(mockCreneaux);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedFiliere, setSelectedFiliere] = useState<Filiere | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [creneauxAffichage, setCreneauxAffichage] = useState<CreneauAffichage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const { toast } = useToast();

  // Fonction pour rafraîchir les données avec des options plus robustes
  const refreshData = async () => {
    if (!supabaseConnected) {
      toast({
        title: "Erreur de connexion",
        description: "Impossible de rafraîchir les données. Connexion non disponible.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Rafraîchissement des données...');
      
      // Recharger les réservations
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select('*')
        .order('date', { ascending: true });
      
      if (reservationsError) {
        throw reservationsError;
      }
      
      if (reservationsData) {
        console.log('Réservations rechargées:', reservationsData);
        setReservations(reservationsData);
      }
      
      // Recharger les utilisateurs
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');
      
      if (usersError) {
        throw usersError;
      }
      
      if (usersData) {
        console.log('Utilisateurs rechargés:', usersData);
        setUsers(usersData);
      }
      
      // Recharger les filières
      const { data: filieresData, error: filieresError } = await supabase
        .from('filieres')
        .select('*');
      
      if (filieresError) {
        throw filieresError;
      }
      
      if (filieresData) {
        console.log('Filières rechargées:', filieresData);
        setFilieres(filieresData);
      }
      
      // Recharger les créneaux
      const { data: creneauxData, error: creneauxError } = await supabase
        .from('creneaux')
        .select('*');
      
      if (creneauxError) {
        throw creneauxError;
      }
      
      if (creneauxData) {
        console.log('Créneaux rechargés:', creneauxData);
        setCreneaux(creneauxData);
      }
      
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des données:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rafraîchir les données",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction utilitaire pour rafraîchir après un délai
  const delayedRefresh = async () => {
    // Attendre 500ms pour laisser le temps à la base de données de finir la transaction
    console.log("Début du délai avant rafraîchissement...");
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("Délai terminé, rafraîchissement des données...");
    await refreshData();
  };

  // Effet pour récupérer l'utilisateur actuel au chargement
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Récupérer les informations complètes de l'utilisateur depuis notre table users
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', user.id)
            .single();
            
          if (data && !error) {
            setCurrentUser(data);
            console.log('Utilisateur actuel chargé:', data);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur actuel:', error);
      }
    };
    
    if (supabaseConnected) {
      getCurrentUser();
    }
  }, [supabaseConnected]);

  // Chargement initial des données depuis Supabase
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        console.log('Attempting to load data from Supabase...');
        
        // Test connection first
        const { data: connectionTest, error: connectionError } = await supabase
          .from('filieres')
          .select('count');
        
        if (connectionError) {
          console.error('Connection test failed:', connectionError);
          throw connectionError;
        }
        
        console.log('Connection test successful:', connectionTest);
        setSupabaseConnected(true);
        
        // Chargement des filières
        const { data: filieresData, error: filieresError } = await supabase
          .from('filieres')
          .select('*');
        
        if (filieresError) {
          console.error('Error loading filieres:', filieresError);
          throw filieresError;
        }
        
        console.log('Loaded filieres:', filieresData);
        if (filieresData) setFilieres(filieresData);
        
        // Chargement des créneaux
        const { data: creneauxData, error: creneauxError } = await supabase
          .from('creneaux')
          .select('*');
        
        if (creneauxError) {
          console.error('Error loading creneaux:', creneauxError);
          throw creneauxError;
        }
        
        console.log('Loaded creneaux:', creneauxData);
        if (creneauxData) setCreneaux(creneauxData);
        
        // Chargement des réservations
        const { data: reservationsData, error: reservationsError } = await supabase
          .from('reservations')
          .select('*')
          .order('date', { ascending: true });
        
        if (reservationsError) {
          console.error('Error loading reservations:', reservationsError);
          throw reservationsError;
        }
        
        console.log('Loaded reservations:', reservationsData);
        if (reservationsData) setReservations(reservationsData);
        
        // Chargement des utilisateurs
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*');
        
        if (usersError) {
          console.error('Error loading users:', usersError);
          throw usersError;
        }
        
        console.log('Loaded users:', usersData);
        if (usersData) setUsers(usersData);
        
        // Définir la filière par défaut si elles sont chargées
        if (filieresData && filieresData.length > 0) {
          setSelectedFiliere(filieresData[0]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données initiales:', error);
        setSupabaseConnected(false);
        toast({
          title: "Erreur de connexion",
          description: "Impossible de charger les données. Utilisation des données locales.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast]);

  // AJOUT: Souscriptions en temps réel Supabase pour les mises à jour de données
  useEffect(() => {
    if (!supabaseConnected) return;
    
    console.log('Mise en place des souscriptions Supabase en temps réel...');
    
    // Souscription aux changements de réservations
    const reservationsSubscription = supabase
      .channel('reservations-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reservations' }, 
        async (payload) => {
          console.log('Changement détecté dans les réservations:', payload);
          delayedRefresh();
      })
      .subscribe();
    
    // Souscription aux changements d'utilisateurs
    const usersSubscription = supabase
      .channel('users-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' }, 
        async (payload) => {
          console.log('Changement détecté dans les utilisateurs:', payload);
          delayedRefresh();
      })
      .subscribe();
    
    // Souscription aux changements de filières
    const filieresSubscription = supabase
      .channel('filieres-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'filieres' }, 
        async (payload) => {
          console.log('Changement détecté dans les filières:', payload);
          delayedRefresh();
      })
      .subscribe();
    
    // Souscription aux changements de créneaux
    const creneauxSubscription = supabase
      .channel('creneaux-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'creneaux' }, 
        async (payload) => {
          console.log('Changement détecté dans les créneaux:', payload);
          delayedRefresh();
      })
      .subscribe();
    
    // Nettoyage des souscriptions quand le composant est démonté
    return () => {
      console.log('Nettoyage des souscriptions Supabase...');
      reservationsSubscription.unsubscribe();
      usersSubscription.unsubscribe();
      filieresSubscription.unsubscribe();
      creneauxSubscription.unsubscribe();
    };
  }, [supabaseConnected]);
  
  // Génération des créneaux d'affichage avec leur statut
  useEffect(() => {
    console.log("Recalcul des créneaux d'affichage...");
    console.log("Nombre de réservations:", reservations.length);
    
    // Obtenir le début de la semaine (lundi)
    const weekStart = new Date(selectedDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    
    // Obtenir les jours de la semaine
    const weekDays: Date[] = [];
    for (let i = 0; i < 5; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      weekDays.push(day);
    }
    
    // Mapper les jours aux jours de la semaine
    const jourMapping: { [key: number]: JourSemaine } = {
      1: 'Lundi',
      2: 'Mardi',
      3: 'Mercredi',
      4: 'Jeudi',
      5: 'Vendredi',
    };
    
    const displayCreneaux: CreneauAffichage[] = [];
    
    // Pour chaque créneau standard
    creneaux.forEach(creneau => {
      // Trouver le jour correspondant dans la semaine actuelle
      const dayIndex = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].indexOf(creneau.jour_semaine);
      
      if (dayIndex !== -1 && dayIndex < weekDays.length) {
        const dateStr = weekDays[dayIndex].toISOString().split('T')[0];
        const now = new Date();
        
        // Vérifier s'il y a une réservation pour ce créneau à cette date
        const reservation = selectedFiliere 
          ? reservations.find(r => 
              r.creneau_id === creneau.id && 
              r.date === dateStr && 
              r.filiere_id === selectedFiliere.id
            )
          : reservations.find(r => 
              r.creneau_id === creneau.id && 
              r.date === dateStr
            );
        
        // Déterminer le statut du créneau
        let statut: 'disponible' | 'reserve' | 'passe' = 'disponible';
        
        // Créer une date pour ce créneau
        const creneauDate = new Date(dateStr);
        const [heureDebut, minuteDebut] = creneau.heure_debut.split(':').map(Number);
        creneauDate.setHours(heureDebut, minuteDebut);
        
        // Obtenir la date actuelle sans le temps
        const today = new Date();
        const currentDateStr = today.toISOString().split('T')[0];
        
        // Vérifier si le créneau est passé (date antérieure ou même jour mais heure passée)
        if (dateStr < currentDateStr || (dateStr === currentDateStr && creneauDate < today)) {
          statut = 'passe';
        } else if (reservation) {
          statut = 'reserve';
        }
        
        // Ajouter les informations supplémentaires
        const utilisateur = reservation ? users.find(u => u.id === reservation.utilisateur_id) : undefined;
        const filiere = reservation ? filieres.find(f => f.id === reservation.filiere_id) : undefined;
        
        displayCreneaux.push({
          ...creneau,
          statut,
          reservation,
          utilisateur,
          filiere,
        });
      }
    });
    
    console.log("Nouveaux créneaux d'affichage générés:", displayCreneaux.length);
    setCreneauxAffichage(displayCreneaux);
  }, [selectedDate, selectedFiliere, reservations, creneaux, users, filieres]);

  // Ajouter une nouvelle réservation avec mise à jour optimiste et rafraîchissement
  const addReservation = async (reservation: Omit<Reservation, 'id'>) => {
    try {
      console.log('Attempting to add reservation:', reservation);
      
      // Check if we're connected to Supabase
      if (!supabaseConnected) {
        console.error('Cannot add reservation: Supabase not connected');
        throw new Error('Database connection not available');
      }
      
      // Validate the reservation data
      if (!reservation.creneau_id || !reservation.utilisateur_id || !reservation.filiere_id || 
          !reservation.date || !reservation.titre_module || !reservation.description) {
        console.error('Invalid reservation data:', reservation);
        throw new Error('Invalid reservation data');
      }
      
      // Insert the reservation
      const { data, error } = await supabase
        .from('reservations')
        .insert([reservation])
        .select();
      
      if (error) {
        console.error('Supabase error inserting reservation:', error);
        throw error;
      }
      
      console.log('Reservation created successfully:', data);
      
      // Force un état optimiste immédiat en ajoutant temporairement au state local
      if (data && data[0]) {
        setReservations(prev => [...prev, data[0]]);
      }
      
      // Puis déclenche un rafraîchissement complet avec délai
      await delayedRefresh();
      
      toast({
        title: "Réservation créée",
        description: "Votre réservation a été créée avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la réservation dans la base de données",
        variant: "destructive",
      });
      
      // Force un rafraîchissement en cas d'erreur pour s'assurer d'un état cohérent
      await delayedRefresh();
      
      throw error; // Re-throw to allow handling in the component
    }
  };

  // Mettre à jour une réservation existante avec mise à jour optimiste et rafraîchissement
  const updateReservation = async (id: string, updatedFields: Partial<Reservation>) => {
    try {
      console.log('Attempting to update reservation:', id, updatedFields);
      
      if (!supabaseConnected) {
        console.error('Cannot update reservation: Supabase not connected');
        throw new Error('Database connection not available');
      }
      
      // Garder une copie de l'état actuel pour restauration en cas d'erreur
      const previousReservations = [...reservations];
      
      // Mise à jour optimiste locale immédiate
      setReservations(prev => 
        prev.map(r => r.id === id ? { ...r, ...updatedFields } : r)
      );
      
      // Effectuer la mise à jour dans la base de données
      const { error } = await supabase
        .from('reservations')
        .update(updatedFields)
        .eq('id', id);
      
      if (error) {
        console.error('Supabase error updating reservation:', error);
        // Restaurer l'état précédent en cas d'erreur
        setReservations(previousReservations);
        throw error;
      }
      
      console.log('Reservation updated successfully');
      
      // Rafraîchir complètement les données après un délai
      await delayedRefresh();
      
      toast({
        title: "Réservation mise à jour",
        description: "La réservation a été modifiée avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la réservation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la réservation dans la base de données",
        variant: "destructive",
      });
      
      // Forcer un rafraîchissement pour s'assurer d'avoir un état cohérent
      await delayedRefresh();
    }
  };

  // Supprimer une réservation avec vérification des permissions utilisateur
  const deleteReservation = async (reservationId: string) => {
    if (!currentUser) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour supprimer une réservation",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      const result = await testReservationDeletion(reservationId, currentUser.id);
      
      if (result.success) {
        // Mettre à jour l'état local des réservations
        setReservations(prevReservations => 
          prevReservations.filter(r => r.id !== reservationId)
        );
        
        // Rafraîchir pour s'assurer de la cohérence des données
        await delayedRefresh();
        
        toast({
          title: "Suppression réussie",
          description: "La réservation a été supprimée avec succès",
        });
        
        return true;
      } else {
        toast({
          title: "Erreur de suppression",
          description: result.error || "Une erreur est survenue",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la réservation:", error);
      toast({
        title: "Erreur inattendue",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
      
      // Forcer un rafraîchissement en cas d'erreur
      await delayedRefresh();
      
      return false;
    }
  };

  // Ajouter un nouvel utilisateur avec rafraîchissement
  const addUser = async (user: Omit<User, 'id'>) => {
    try {
      if (!supabaseConnected) {
        throw new Error('Database connection not available');
      }
      
      const { data, error } = await supabase
        .from('users')
        .insert([user])
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        // Mise à jour optimiste locale
        setUsers(prev => [...prev, data[0]]);
      }
      
      // Rafraîchir complètement après un délai
      await delayedRefresh();
      
      toast({
        title: "Utilisateur créé",
        description: `L'utilisateur ${user.prenom} ${user.nom} a été créé avec succès`,
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'utilisateur dans la base de données",
        variant: "destructive",
      });
      
      // Forcer un rafraîchissement
      await delayedRefresh();
    }
  };

  // Mettre à jour un utilisateur existant avec rafraîchissement
  const updateUser = async (id: string, updatedFields: Partial<User>) => {
    try {
      if (!supabaseConnected) {
        throw new Error('Database connection not available');
      }
      
      // Mise à jour optimiste
      setUsers(users.map(u => u.id === id ? { ...u, ...updatedFields } : u));
      
      const { error } = await supabase
        .from('users')
        .update(updatedFields)
        .eq('id', id);
      
      if (error) throw error;
      
      // Rafraîchir complètement après un délai
      await delayedRefresh();
      
      toast({
        title: "Utilisateur mis à jour",
        description: "Les informations de l'utilisateur ont été modifiées avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'utilisateur dans la base de données",
        variant: "destructive",
      });
      
      // Forcer un rafraîchissement
      await delayedRefresh();
    }
  };

  // Supprimer un utilisateur avec rafraîchissement
  const deleteUser = async (id: string) => {
    try {
      if (!supabaseConnected) {
        throw new Error('Database connection not available');
      }
      
      // Mise à jour optimiste
      setUsers(users.filter(u => u.id !== id));
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Rafraîchir complètement après un délai
      await delayedRefresh();
      
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur de la base de données",
        variant: "destructive",
      });
      
      // Forcer un rafraîchissement
      await delayedRefresh();
    }
  };

  // Récupérer un créneau par son ID
  const getCreneauById = (id: string) => {
    return creneaux.find(c => c.id === id);
  };

  // Récupérer une filière par son ID
  const getFiliereById = (id: string) => {
    return filieres.find(f => f.id === id);
  };

  // Récupérer un utilisateur par son ID
  const getUserById = (id: string) => {
    return users.find(u => u.id === id);
  };

  // Récupérer les réservations pour une semaine donnée
  const getReservationsForWeek = (date: Date, filiereId?: string) => {
    // Obtenir le début de la semaine (lundi)
    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    
    // Obtenir la fin de la semaine (vendredi)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 4);
    weekEnd.setHours(23, 59, 59, 999);
    
    return reservations.filter(r => {
      const reservationDate = new Date(r.date);
      const isInWeek = reservationDate >= weekStart && reservationDate <= weekEnd;
      return filiereId 
        ? isInWeek && r.filiere_id === filiereId
        : isInWeek;
    });
  };

  // Convertir une date en jour de la semaine
  const getJourSemaineFromDate = (date: Date): JourSemaine | null => {
    const jourMapping: { [key: number]: JourSemaine } = {
      1: 'Lundi',
      2: 'Mardi',
      3: 'Mercredi',
      4: 'Jeudi',
      5: 'Vendredi',
    };
    
    const day = date.getDay();
    return jourMapping[day] || null;
  };

  return (
    <AppContext.Provider
      value={{
        filieres,
        creneaux,
        reservations,
        users,
        selectedFiliere,
        selectedDate,
        creneauxAffichage,
        currentUser,
        setSelectedFiliere,
        setSelectedDate,
        addReservation,
        updateReservation,
        deleteReservation,
        addUser,
        updateUser,
        deleteUser,
        getCreneauById,
        getFiliereById,
        getUserById,
        getReservationsForWeek,
        getJourSemaineFromDate,
        isLoading,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp doit être utilisé à l\'intérieur d\'un AppProvider');
  }
  return context;
};
