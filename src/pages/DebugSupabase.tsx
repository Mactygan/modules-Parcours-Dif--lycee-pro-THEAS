import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { testSupabaseConnection, checkEnvironmentVariables } from '@/integrations/supabase/debug';
import { supabase, checkConnection } from '@/integrations/supabase/client';

interface ConnectionStatus {
  success: boolean;
  message: string;
  details?: any;
}

const DebugSupabase = () => {
  const [envVars, setEnvVars] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    // Check environment variables on component mount
    const vars = checkEnvironmentVariables();
    setEnvVars(vars);
  }, []);

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const result = await testSupabaseConnection();
      
      setConnectionStatus({
        success: result.success,
        message: result.success 
          ? 'Connection successful!' 
          : `Connection failed: ${result.error}`,
        details: result
      });
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: `Error testing connection: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleListTables = async () => {
    setIsLoading(true);
    try {
      // This query lists all tables the user has access to
      const { data, error } = await supabase
        .from('pg_catalog.pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
      
      if (error) throw error;
      
      if (data) {
        setTables(data.map((row: any) => row.tablename));
      }
    } catch (error) {
      console.error('Error listing tables:', error);
      setTables([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Debugging</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Check if Supabase environment variables are properly loaded</CardDescription>
          </CardHeader>
          <CardContent>
            {envVars ? (
              <div className="space-y-2">
                <p>VITE_SUPABASE_URL: {envVars.hasUrl ? '✅ Present' : '❌ Missing'}</p>
                <p>VITE_SUPABASE_ANON_KEY: {envVars.hasKey ? '✅ Present' : '❌ Missing'}</p>
                {envVars.url && <p>URL: {envVars.url}</p>}
              </div>
            ) : (
              <p>Loading environment variables...</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Connection Test</CardTitle>
            <CardDescription>Test the connection to your Supabase instance</CardDescription>
          </CardHeader>
          <CardContent>
            {connectionStatus && (
              <div className={`p-4 rounded-md ${connectionStatus.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <p className="font-medium">{connectionStatus.message}</p>
                {!connectionStatus.success && connectionStatus.details && (
                  <pre className="mt-2 text-sm overflow-auto max-h-40">
                    {JSON.stringify(connectionStatus.details, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleTestConnection} disabled={isLoading}>
              {isLoading ? 'Testing...' : 'Test Connection'}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Available Tables</CardTitle>
            <CardDescription>List tables you have access to in your Supabase database</CardDescription>
          </CardHeader>
          <CardContent>
            {tables.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {tables.map((table) => (
                  <li key={table}>{table}</li>
                ))}
              </ul>
            ) : (
              <p>No tables found or not yet queried.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleListTables} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'List Tables'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default DebugSupabase;
