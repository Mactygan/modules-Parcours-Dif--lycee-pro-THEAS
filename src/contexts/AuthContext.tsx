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
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: userId,
              first_name: 'Utilisateur',
              last_name: 'Temporaire',
              role: 'enseignant'
            });

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
        const user: User = {
          id: profile.id,
          prenom: profile.first_name || '',
          nom: profile.last_name || '',
          email: session?.user?.email || '',
          role: profile.role as Role || 'enseignant',
        };
        setCurrentUser(user);

        // Stocker l'utilisateur dans localStorage pour persistance
        localStorage.setItem('currentUser', JSON.stringify(user));

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

    const setupAuth = async () => {
      try {
        // Vérifier d'abord s'il y a un utilisateur stocké localement
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setCurrentUser(parsedUser);
          } catch (e) {
            console.error('Error parsing stored user:', e);
            localStorage.removeItem('currentUser');
          }
        }

        // Vérifier s'il y a une session existante
        const { data: { session: existingSession } } = await supabase.auth.getSession();

        if (existingSession) {
          console.log('Session retrieved from localStorage:', existingSession.user.email);
          setSession(existingSession);

          // Attendre que le profil soit chargé
          await fetchUserProfile(existingSession.user.id);
        } else {
          console.log('No existing session found');
          localStorage.removeItem('currentUser');
          setCurrentUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking existing session:', error);
        setIsLoading(false);
      }
    };

    // Configurer l'écouteur d'état d'authentification
    const setupAuthListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log('Auth state changed:', event, newSession?.user?.email);

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            setSession(newSession);

            if (newSession?.user) {
              await fetchUserProfile(newSession.user.id);
            }
          } else if (event === 'SIGNED_OUT') {
            setSession(null);
            setCurrentUser(null);
            localStorage.removeItem('currentUser');
            setIsLoading(false);
          }
        }
      );

      return subscription;
    };

    // Exécuter la configuration de l'auth de manière asynchrone
    let subscription: { unsubscribe: () => void } | null = null;

    setupAuth().then(() => {
      subscription = setupAuthListener();
    });

    // Nettoyage
    return () => {
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
      localStorage.removeItem('currentUser');

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
