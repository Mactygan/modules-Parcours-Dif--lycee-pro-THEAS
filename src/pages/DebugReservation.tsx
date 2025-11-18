import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { testReservationCreation } from '@/integrations/supabase/reservation-debug';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const DebugReservation = () => {
  const { filieres, creneaux, addReservation } = useApp();
  const { currentUser } = useAuth();
  
  const [creneauId, setCreneauId] = useState('');
  const [filiereId, setFiliereId] = useState('');
  const [titre, setTitre] = useState('Test Module');
  const [description, setDescription] = useState('This is a test reservation for debugging purposes.');
  const [salle, setSalle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [directResult, setDirectResult] = useState<any>(null);

  const handleTestReservation = async () => {
    if (!currentUser || !creneauId || !filiereId) {
      setResult({
        success: false,
        error: 'Missing required fields',
        details: { hasUser: !!currentUser, hasCreneau: !!creneauId, hasFiliere: !!filiereId }
      });
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    
    try {
      // Ensure teacher info is in description
      let finalDescription = description;
      if (currentUser) {
        const teacherInfo = `Module présenté par ${currentUser.prenom} ${currentUser.nom}\n\n`;
        if (!finalDescription.includes(teacherInfo)) {
          finalDescription = teacherInfo + finalDescription;
        }
      }
      
      const testReservation = {
        creneau_id: creneauId,
        utilisateur_id: currentUser.id,
        filiere_id: filiereId,
        date: format(new Date(), 'yyyy-MM-dd'),
        titre_module: titre,
        description: finalDescription,
        salle: salle || undefined,
        created_at: new Date().toISOString()
      };
      
      const debugResult = await testReservationCreation(testReservation);
      setResult(debugResult);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectReservation = async () => {
    if (!currentUser || !creneauId || !filiereId) {
      setDirectResult({
        success: false,
        error: 'Missing required fields',
        details: { hasUser: !!currentUser, hasCreneau: !!creneauId, hasFiliere: !!filiereId }
      });
      return;
    }
    
    setIsLoading(true);
    setDirectResult(null);
    
    try {
      // Ensure teacher info is in description
      let finalDescription = description;
      if (currentUser) {
        const teacherInfo = `Module présenté par ${currentUser.prenom} ${currentUser.nom}\n\n`;
        if (!finalDescription.includes(teacherInfo)) {
          finalDescription = teacherInfo + finalDescription;
        }
      }
      
      const newReservation = {
        creneau_id: creneauId,
        utilisateur_id: currentUser.id,
        filiere_id: filiereId,
        date: format(new Date(), 'yyyy-MM-dd'),
        titre_module: titre,
        description: finalDescription,
        salle: salle || undefined,
        created_at: new Date().toISOString()
      };
      
      await addReservation(newReservation);
      setDirectResult({
        success: true,
        message: 'Reservation created successfully through addReservation'
      });
    } catch (error) {
      setDirectResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Reservation Debugging</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Reservation Creation</CardTitle>
            <CardDescription>Create a test reservation to debug issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creneau">Créneau</Label>
                  <Select value={creneauId} onValueChange={setCreneauId}>
                    <SelectTrigger id="creneau">
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
                
                <div className="space-y-2">
                  <Label htmlFor="filiere">Filière</Label>
                  <Select value={filiereId} onValueChange={setFiliereId}>
                    <SelectTrigger id="filiere">
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
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="titre">Titre du module</Label>
                <Input
                  id="titre"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salle">Salle (optionnel)</Label>
                <Input
                  id="salle"
                  value={salle}
                  onChange={(e) => setSalle(e.target.value)}
                />
              </div>
            </div>
            
            {result && (
              <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <h3 className="font-medium mb-2">{result.success ? 'Success' : 'Error'}</h3>
                <pre className="text-xs overflow-auto max-h-40">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handleTestReservation} disabled={isLoading}>
              {isLoading ? 'Testing...' : 'Test Reservation API'}
            </Button>
            <Button onClick={handleDirectReservation} disabled={isLoading} variant="secondary">
              {isLoading ? 'Creating...' : 'Test addReservation Function'}
            </Button>
          </CardFooter>
        </Card>
        
        {directResult && (
          <Card>
            <CardHeader>
              <CardTitle>Direct Reservation Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-md ${directResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <h3 className="font-medium mb-2">{directResult.success ? 'Success' : 'Error'}</h3>
                <pre className="text-xs overflow-auto max-h-40">
                  {JSON.stringify(directResult, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Current User</CardTitle>
          </CardHeader>
          <CardContent>
            {currentUser ? (
              <pre className="text-xs overflow-auto max-h-40">
                {JSON.stringify(currentUser, null, 2)}
              </pre>
            ) : (
              <p>No user logged in</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DebugReservation;
