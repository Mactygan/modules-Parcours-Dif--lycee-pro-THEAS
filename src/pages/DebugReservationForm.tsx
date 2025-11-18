import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { testReservationCreation } from '@/integrations/supabase/reservation-debug';
import { supabase } from '@/integrations/supabase/client';

const DebugReservationForm: React.FC = () => {
  const { filieres, creneaux, addReservation } = useApp();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    creneau_id: '',
    filiere_id: '',
    titre_module: 'Test Module',
    description: 'Ceci est un test de réservation',
    axe_pedagogique: '',
    salle: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<any>(null);
  
  // Automatically update description with teacher name when user is loaded
  useEffect(() => {
    if (currentUser) {
      const teacherInfo = `Module présenté par ${currentUser.prenom} ${currentUser.nom}\n\n`;
      setFormData(prev => ({
        ...prev,
        description: teacherInfo + (prev.description.startsWith(teacherInfo) ? prev.description.substring(teacherInfo.length) : prev.description)
      }));
    }
  }, [currentUser]);
  
  // Vérifier le statut d'authentification
  const checkAuthStatus = async () => {
    const { data, error } = await supabase.auth.getSession();
    setAuthStatus({ data, error });
  };
  
  // Tester la création directe via l'API Supabase
  const testDirectCreation = async () => {
    if (!currentUser) {
      setResult({ error: "Utilisateur non connecté" });
      return;
    }
    
    setLoading(true);
    
    try {
      const reservationData = {
        ...formData,
        utilisateur_id: currentUser.id,
        created_at: new Date().toISOString()
      };
      
      console.log("Données de réservation à envoyer:", reservationData);
      
      const { data, error } = await supabase
        .from('reservations')
        .insert([reservationData])
        .select();
      
      setResult({ 
        method: "Direct Supabase API",
        success: !error,
        data,
        error
      });
    } catch (err) {
      setResult({ 
        method: "Direct Supabase API",
        success: false,
        error: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Tester via la fonction de débogage
  const testViaDebugFunction = async () => {
    if (!currentUser) {
      setResult({ error: "Utilisateur non connecté" });
      return;
    }
    
    setLoading(true);
    
    try {
      const reservationData = {
        ...formData,
        utilisateur_id: currentUser.id,
        created_at: new Date().toISOString()
      };
      
      console.log("Données de réservation à envoyer via debug:", reservationData);
      
      const result = await testReservationCreation(reservationData);
      setResult({ 
        method: "Debug Function",
        ...result
      });
    } catch (err) {
      setResult({ 
        method: "Debug Function",
        success: false,
        error: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Tester via le contexte d'application
  const testViaAppContext = async () => {
    if (!currentUser) {
      setResult({ error: "Utilisateur non connecté" });
      return;
    }
    
    setLoading(true);
    
    try {
      const reservationData = {
        ...formData,
        utilisateur_id: currentUser.id,
        created_at: new Date().toISOString()
      };
      
      console.log("Données de réservation à envoyer via context:", reservationData);
      
      await addReservation(reservationData);
      
      setResult({ 
        method: "App Context",
        success: true,
        message: "Réservation créée avec succès via le contexte d'application"
      });
    } catch (err) {
      setResult({ 
        method: "App Context",
        success: false,
        error: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-2xl font-bold">Débogage du formulaire de réservation</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Statut d'authentification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p>Utilisateur actuel: {currentUser ? `${currentUser.prenom} ${currentUser.nom} (${currentUser.id})` : 'Non connecté'}</p>
          </div>
          <Button onClick={checkAuthStatus}>Vérifier le statut d'authentification</Button>
          
          {authStatus && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <pre className="whitespace-pre-wrap text-xs">
                {JSON.stringify(authStatus, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Formulaire de test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="filiere">Filière</Label>
              <Select 
                value={formData.filiere_id} 
                onValueChange={(value) => setFormData({...formData, filiere_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une filière" />
                </SelectTrigger>
                <SelectContent>
                  {filieres.map(filiere => (
                    <SelectItem key={filiere.id} value={filiere.id}>
                      {filiere.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="creneau">Créneau</Label>
              <Select 
                value={formData.creneau_id} 
                onValueChange={(value) => setFormData({...formData, creneau_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un créneau" />
                </SelectTrigger>
                <SelectContent>
                  {creneaux.map(creneau => (
                    <SelectItem key={creneau.id} value={creneau.id}>
                      {creneau.jour_semaine} {creneau.heure_debut}-{creneau.heure_fin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="titre">Titre du module</Label>
              <Input
                id="titre"
                value={formData.titre_module}
                onChange={(e) => setFormData({...formData, titre_module: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="axe_pedagogique">Axe pédagogique</Label>
              <Input
                id="axe_pedagogique"
                value={formData.axe_pedagogique}
                onChange={(e) => setFormData({...formData, axe_pedagogique: e.target.value})}
                placeholder="Ex: Consolidation et renforcement disciplinaire, Consolidation et renforcement de la méthodologie, Développement des compétences psychosociales"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="salle">Salle (optionnel)</Label>
              <Input
                id="salle"
                value={formData.salle}
                onChange={(e) => setFormData({...formData, salle: e.target.value})}
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button onClick={testDirectCreation} disabled={loading}>
              Tester API Supabase directe
            </Button>
            <Button onClick={testViaDebugFunction} disabled={loading} variant="outline">
              Tester via fonction debug
            </Button>
            <Button onClick={testViaAppContext} disabled={loading} variant="secondary">
              Tester via AppContext
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Résultat du test ({result.method})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-md">
              <pre className="whitespace-pre-wrap text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DebugReservationForm;
