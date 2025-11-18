import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from '@/components/Logo';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Simplifié: ne vérifie plus la session manuellement au chargement
  useEffect(() => {
    console.log("Login page loaded, waiting for auth state");
  }, []);

  // Redirection simplifiée et plus fiable
  useEffect(() => {
    console.log("Login page - Authentication state:", {
      isAuthenticated,
      authLoading,
      timestamp: new Date().toISOString()
    });

    // Ne redirige que lorsque l'authentification est confirmée et le chargement terminé
    if (isAuthenticated && !authLoading) {
      console.log("Redirecting to /calendrier because user is authenticated");
      navigate('/calendrier', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(email, password);
      console.log("Login result:", success);

      if (!success) {
        setError('Échec de connexion. Vérifiez vos identifiants.');
      }
      // Ne pas tenter de rediriger ici, laissez le useEffect s'en charger
    } catch (err) {
      console.error('Login error caught:', err);
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-semibold text-center">
            Connexion
          </CardTitle>
          <CardDescription className="text-center">
            Entrez vos identifiants pour accéder à la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || authLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || authLoading}
              />
            </div>
            {error && (
              <div className="text-sm font-medium text-destructive">{error}</div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || authLoading}
            >
              {isLoading || authLoading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          {/* Removed admin access text */}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
