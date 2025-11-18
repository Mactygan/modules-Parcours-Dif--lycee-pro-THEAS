import { createClient } from '@supabase/supabase-js';

// Utilisation des valeurs fournies directement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérification des valeurs
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey
  });
  throw new Error('supabaseUrl and supabaseAnonKey are required.');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

// Création du client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'x-application-name': 'modulev2-formation'
    }
  }
});

// Vérifier que le client est correctement initialisé
console.log('Supabase client initialized successfully');

// Fonction utilitaire pour vérifier la connexion
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase.from('filieres').select('count');
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return { success: false, error };
  }
};

// Exécuter la vérification de connexion au démarrage
checkConnection().then(result => {
  console.log('Initial connection check result:', result);
});
