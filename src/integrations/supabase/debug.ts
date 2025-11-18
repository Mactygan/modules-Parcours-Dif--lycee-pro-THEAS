import { supabase } from './client';

// Function to test Supabase connection
export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Check if we can connect to Supabase
    const { data, error } = await supabase.from('filieres').select('count');
    
    if (error) {
      console.error('Supabase connection error:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
    
    console.log('Supabase connection successful:', data);
    return {
      success: true,
      data
    };
  } catch (err) {
    console.error('Unexpected error testing Supabase connection:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      details: err
    };
  }
}

// Function to check environment variables
export function checkEnvironmentVariables() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('Checking environment variables...');
  console.log('VITE_SUPABASE_URL exists:', !!supabaseUrl);
  console.log('VITE_SUPABASE_ANON_KEY exists:', !!supabaseKey);
  
  // Don't log the full key for security reasons
  if (supabaseKey) {
    console.log('VITE_SUPABASE_ANON_KEY starts with:', supabaseKey.substring(0, 10) + '...');
  }
  
  return {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    url: supabaseUrl ? supabaseUrl : null
  };
}
