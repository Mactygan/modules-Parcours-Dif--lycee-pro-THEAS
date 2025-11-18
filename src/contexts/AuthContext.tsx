import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (role: Role) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Fetch user profile with proper error handling and corrected query method
  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      console.log('Fetching user profile for ID:', userId);
      // Correction de la méthode de requête pour éviter l'erreur 406
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)  // Utiliser .eq() au lieu de .match()
        .maybeSingle();

      if (error) {
        console.log('Error fetching profile, creating default user:', error.message);

        if (session?.user?.email) {
          console.log('Creating default profile for user:', userId);
          const defaultUser: User = {
            id: userId,
            prenom: 'Utilisateur',
            nom: 'Temporaire',
            email: session.user.email,
            role: 'enseignant' as Role,
          };

          // Tentative d'insertion avec gestion d'erreur améliorée
          // Essayer d'abord avec le nouveau schéma (prenom/nom), puis avec l'ancien si échec
          let insertError;
          const newSchemaResult = await supabase
            .from('users')
            .insert({
              id: userId,
              prenom: 'Utilisateur',
              nom: 'Temporaire',
              role: 'enseignant'
            });

          insertError = newSchemaResult.error;

          // Si échec avec le nouveau schéma, essayer l'ancien
          if (insertError && insertError.message?.includes('column')) {
            console.log('Trying old schema (first_name/last_name)...');
            const oldSchemaResult = await supabase
              .from('users')
              .insert({
                id: userId,
                first_name: 'Utilisateur',
                last_name: 'Temporaire',
                role: 'enseignant'
              });
            insertError = oldSchemaResult.error;
          }

          if (insertError) {
            console.error('Error creating profile:', insertError);
            toast({
              title: "Erreur de profil",
              description: "Impossible de créer votre profil utilisateur",
              variant: "destructive",
            });
            setIsLoading(false);
            return null;
          }
          
          console.log('Default profile created successfully');
          setCurrentUser(defaultUser);
          setIsLoading(false);
          return defaultUser;
        }
        setIsLoading(false);
        return null;
      }

      if (profile) {
        console.log('Profile found:', profile);
        // Support both old (first_name/last_name) and new (prenom/nom) schema during migration
        const user: User = {
          id: profile.id,
          prenom: profile.prenom || profile.first_name || '',
          nom: profile.nom || profile.last_name || '',
          email: session?.user?.email || '',
          role: profile.role as Role || 'enseignant',
        };
        setCurrentUser(user);

        // Note: Ne pas stocker les données utilisateur dans localStorage pour des raisons de sécurité
        // Supabase gère déjà la persistance de session de manière sécurisée

        setIsLoading(false);
        return user;
      }

      console.log('No profile found and no error - unexpected state');
      setIsLoading(false);
      return null;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      toast({
        title: "Erreur",
        description: "Problème lors de la récupération du profil",
        variant: "destructive",
      });
      setIsLoading(false);
      return null;
    }
  };

  // Set up auth state listener and check for existing session
  useEffect(() => {
    console.log('Setting up auth state listener');
    setIsLoading(true);

    // Flag pour éviter les mises à jour d'état après le démontage
    let isMounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      try {
        // Étape 1: Configurer d'abord l'écouteur pour capturer tous les événements
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (!isMounted) return;

            console.log('Auth state changed:', event, newSession?.user?.email);

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              setSession(newSession);

              if (newSession?.user) {
                await fetchUserProfile(newSession.user.id);
              }
            } else if (event === 'SIGNED_OUT') {
              setSession(null);
              setCurrentUser(null);
              setIsLoading(false);
            } else if (event === 'INITIAL_SESSION') {
              // Gérer la session initiale via l'écouteur
              if (newSession) {
                setSession(newSession);
                await fetchUserProfile(newSession.user.id);
              } else {
                setCurrentUser(null);
                setIsLoading(false);
              }
            }
          }
        );

        subscription = authSubscription;

        // Étape 2: Vérifier la session existante (après avoir configuré l'écouteur)
        const { data: { session: existingSession } } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (existingSession) {
          console.log('Session retrieved from Supabase:', existingSession.user.email);
          // Ne pas dupliquer le traitement si INITIAL_SESSION l'a déjà fait
          // On laisse l'écouteur gérer la session via l'événement INITIAL_SESSION
        } else {
          console.log('No existing session found');
          setCurrentUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        if (!isMounted) return;

        console.error('Error initializing auth:', error);
        setIsLoading(false);
        toast({
          title: "Erreur d'authentification",
          description: "Impossible d'initialiser l'authentification",
          variant: "destructive",
        });
      }
    };

    // Démarrer l'initialisation
    initializeAuth();

    // Nettoyage
    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Sign in with Supabase without custom session duration
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Ajouter des logs pour le débogage
      console.log('Login params:', { email, passwordLength: password.length });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
        // Utilisation de la durée par défaut de Supabase
      });
      
      // Logs détaillés pour voir la réponse
      console.log('Login response data:', data);
      console.log('Login response error details:', error);

      if (error) {
        toast({
          title: "Échec de connexion",
          description: `${error.message}`,
          variant: "destructive",
        });
        console.error('Login error details:', error);
        setIsLoading(false);
        return false;
      }

      if (data.user) {
        try {
          // Wait explicitly for the profile to be loaded before continuing
          const user = await fetchUserProfile(data.user.id);
          if (user) {
            toast({
              title: "Connexion réussie",
              description: "Vous êtes maintenant connecté",
            });
            console.log('Login successful and profile loaded for:', data.user.email);
            setIsLoading(false); // S'assurer que isLoading est mis à false ici
            return true;
          } else {
            toast({
              title: "Erreur de profil",
              description: "Impossible de récupérer votre profil",
              variant: "destructive",
            });
            // Déconnexion si le profil n'a pas pu être chargé
            await supabase.auth.signOut();
            setIsLoading(false);
            return false;
          }
        } catch (profileError) {
          console.error('Error fetching profile after login:', profileError);
          toast({
            title: "Erreur de profil",
            description: "Impossible de récupérer votre profil",
            variant: "destructive",
          });
          // Déconnexion si une erreur s'est produite
          await supabase.auth.signOut();
          setIsLoading(false);
          return false;
        }
      }
      
      // Si on arrive ici, c'est qu'il y a eu un problème
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la connexion",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  };

  // Sign out with Supabase with proper cleanup
  const logout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setCurrentUser(null);
      setSession(null);

      toast({
        title: "Déconnexion",
        description: "Vous avez été déconnecté avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la déconnexion",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (role: Role): boolean => {
    return currentUser?.role === role;
  };

  // Enhanced logging for debugging auth state
  useEffect(() => {
    console.log('Auth state updated with details:', {
      isAuthenticated: !!currentUser,
      user: currentUser?.email,
      role: currentUser?.role,
      sessionExists: !!session,
      loading: isLoading,
      timestamp: new Date().toISOString()
    });
  }, [currentUser, session, isLoading]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
