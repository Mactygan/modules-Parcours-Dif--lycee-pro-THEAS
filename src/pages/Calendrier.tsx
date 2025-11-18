import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { format, addDays, startOfWeek, subWeeks, addWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, CalendarIcon, Info } from "lucide-react";
import { Creneau, CreneauAffichage } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { testReservationCreation } from '@/integrations/supabase/reservation-debug';

const Calendrier: React.FC = () => {
  const { 
    filieres, 
    selectedFiliere, 
    setSelectedFiliere, 
    selectedDate, 
    setSelectedDate, 
    creneauxAffichage, 
    addReservation,
    isLoading
  } = useApp();
  
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCreneau, setSelectedCreneau] = useState<CreneauAffichage | null>(null);
  
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [salle, setSalle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Grouper les créneaux par jour
  const creneauxParJour = creneauxAffichage.reduce((acc, creneau) => {
    if (!acc[creneau.jour_semaine]) {
      acc[creneau.jour_semaine] = [];
    }
    acc[creneau.jour_semaine].push(creneau);
    return acc;
  }, {} as Record<string, CreneauAffichage[]>);

  // Obtenir les jours de la semaine pour l'affichage
  const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  
  // Obtenir les dates de la semaine actuelle
  const debutSemaine = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const datesSemaine = joursSemaine.map((_, index) => addDays(debutSemaine, index));

  // Naviguer à la semaine précédente
  const semainePrecedente = () => {
    setSelectedDate(subWeeks(selectedDate, 1));
  };

  // Naviguer à la semaine suivante
  const semaineSuivante = () => {
    setSelectedDate(addWeeks(selectedDate, 1));
  };

  // Ouvrir la modal de réservation
  const handleReservation = (creneau: CreneauAffichage) => {
    if (!currentUser) {
      toast({
        title: "Non autorisé",
        description: "Vous devez être connecté pour réserver un créneau",
        variant: "destructive",
      });
      return;
    }
    
    if (creneau.statut !== 'disponible') {
      toast({
        title: "Créneau non disponible",
        description: "Ce créneau n'est pas disponible pour une réservation",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedCreneau(creneau);
    setTitre('');
    setDescription('');
    setSalle('');
    setIsReservationOpen(true);
  };

  // Ouvrir la modal de détails
  const handleDetails = (creneau: CreneauAffichage) => {
    setSelectedCreneau(creneau);
    setIsDetailsOpen(true);
  };

  // Soumettre le formulaire de réservation
  const handleSubmit = async () => {
    if (!selectedCreneau || !currentUser || !selectedFiliere) return;
    
    if (!titre || !description) {
      toast({
        title: "Champs obligatoires",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    setDebugInfo(null);
    
    // Trouver la date correspondant au jour de la semaine du créneau
    const jourIndex = joursSemaine.indexOf(selectedCreneau.jour_semaine);
    if (jourIndex === -1) {
      console.error('Jour de la semaine non trouvé:', selectedCreneau.jour_semaine);
      toast({
        title: "Erreur",
        description: "Jour de la semaine invalide",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    const date = format(datesSemaine[jourIndex], 'yyyy-MM-dd');
    console.log("Date formatée pour la réservation:", date); // Log de débogage
    
    // Ensure teacher info is in description
    let finalDescription = description;
    if (currentUser) {
      const teacherInfo = `Module présenté par ${currentUser.prenom} ${currentUser.nom}\n\n`;
      if (!finalDescription.includes(teacherInfo)) {
        finalDescription = teacherInfo + finalDescription;
      }
    }
    
    const nouvelleReservation = {
      creneau_id: selectedCreneau.id,
      utilisateur_id: currentUser.id,
      filiere_id: selectedFiliere.id,
      date,
      titre_module: titre,
      description: finalDescription,
      salle: salle || undefined,
      created_at: new Date().toISOString()
    };
    
    try {
  const debugResult = await testReservationCreation(nouvelleReservation);
  setDebugInfo(debugResult);
  
  if (debugResult.success) {
    // If debug test passed, proceed with actual reservation
    await addReservation(nouvelleReservation);
    setIsReservationOpen(false);
    
    // Afficher un message de confirmation
    toast({
      title: "Réservation créée",
      description: "Votre réservation a été créée avec succès",
    });
  } else {
    console.error('Debug reservation creation failed:', debugResult);
    toast({
      title: "Erreur de débogage",
      description: `Échec du test de création: ${debugResult.error}`,
      variant: "destructive",
    });
    setShowDebug(true);
  }
} catch (error) {
  console.error('Error creating reservation:', error);
  toast({
    title: "Erreur",
    description: "Une erreur est survenue lors de la création de la réservation",
    variant: "destructive",
  });
  setIsReservationOpen(false); // Fermez la modal en cas d'erreur générale
} finally {
  setIsSubmitting(false);
}
  };

  // Formater l'affichage d'un créneau
  const formatCreneau = (creneau: CreneauAffichage) => {
    return `${creneau.heure_debut} - ${creneau.heure_fin}`;
  };

  // Obtenir la classe CSS en fonction du statut du créneau
  const getCreneauClass = (statut: 'disponible' | 'reserve' | 'passe') => {
    switch (statut) {
      case 'disponible':
        return 'bg-green-100 hover:bg-green-200 border-green-300';
      case 'reserve':
        return 'bg-blue-100 hover:bg-blue-200 border-blue-300';
      case 'passe':
        return 'bg-gray-100 hover:bg-gray-200 border-gray-300 opacity-60';
    }
  };

  // Log pour le débogage
  useEffect(() => {
    console.log("Créneaux d'affichage mis à jour:", creneauxAffichage.length);
  }, [creneauxAffichage]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Calendrier des modules</h1>
          <p className="text-muted-foreground">Consultez et réservez des créneaux pour vos modules</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select
            value={selectedFiliere?.id || ''}
            onValueChange={(value) => {
              const filiere = filieres.find(f => f.id === value);
              setSelectedFiliere(filiere || null);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sélectionner une filière" />
            </SelectTrigger>
            <SelectContent>
              {filieres.map((filiere) => (
                <SelectItem key={filiere.id} value={filiere.id}>
                  {filiere.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={semainePrecedente}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(debutSemaine, 'dd MMMM', { locale: fr })} - {format(addDays(debutSemaine, 4), 'dd MMMM yyyy', { locale: fr })}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Sélectionner une date</DialogTitle>
                  <DialogDescription>
                    Choisissez une date pour afficher la semaine correspondante
                  </DialogDescription>
                </DialogHeader>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="icon" onClick={semaineSuivante}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-4">
          {joursSemaine.map((jour, index) => (
            <div key={jour} className="space-y-4">
              <div className="text-center">
                <h3 className="font-medium">{jour}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(datesSemaine[index], 'dd MMMM', { locale: fr })}
                </p>
              </div>
              
              <div className="space-y-2">
                {creneauxParJour[jour]?.sort((a, b) => a.heure_debut.localeCompare(b.heure_debut)).map((creneau) => (
                  <div
                    key={creneau.id}
                    className={`p-2 rounded border cursor-pointer ${getCreneauClass(creneau.statut)}`}
                    onClick={() => creneau.statut === 'disponible' ? handleReservation(creneau) : handleDetails(creneau)}
                  >
                    <div className="text-sm font-medium">{formatCreneau(creneau)}</div>
                    {creneau.statut === 'reserve' && creneau.reservation && (
                      <div className="mt-1 text-xs truncate">
                        {creneau.reservation.titre_module}
                      </div>
                    )}
                  </div>
                ))}
                
                {(!creneauxParJour[jour] || creneauxParJour[jour].length === 0) && (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    Aucun créneau disponible
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de réservation */}
      <Dialog open={isReservationOpen} onOpenChange={setIsReservationOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Réserver un créneau</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour réserver ce créneau
            </DialogDescription>
          </DialogHeader>
          
          {selectedCreneau && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>
                  {selectedCreneau.jour_semaine}, {formatCreneau(selectedCreneau)}
                </span>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="titre" className="required">Titre du module</Label>
                <Input
                  id="titre"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description" className="required">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="salle">Demande de salle (optionnel)</Label>
                <Input
                  id="salle"
                  value={salle}
                  onChange={(e) => setSalle(e.target.value)}
                />
              </div>
            </div>
          )}
          
          {debugInfo && showDebug && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center mb-2">
                <Info className="h-4 w-4 text-yellow-500 mr-2" />
                <h4 className="text-sm font-medium">Informations de débogage</h4>
              </div>
              <pre className="text-xs overflow-auto max-h-40">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReservationOpen(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Réservation en cours...' : 'Réserver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de détails */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails du créneau</DialogTitle>
          </DialogHeader>
          
          {selectedCreneau && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>
                  {selectedCreneau.jour_semaine}, {formatCreneau(selectedCreneau)}
                </span>
              </div>
              
              {selectedCreneau.statut === 'reserve' && selectedCreneau.reservation && (
                <>
                  <div>
                    <Label className="text-sm text-muted-foreground">Module</Label>
                    <p className="font-medium">{selectedCreneau.reservation.titre_module}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">Description</Label>
                    <p className="whitespace-pre-line">{selectedCreneau.reservation.description}</p>
                  </div>
                  
                  {selectedCreneau.reservation.salle && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Salle</Label>
                      <p>{selectedCreneau.reservation.salle}</p>
                    </div>
                  )}
                  
                  {selectedCreneau.utilisateur && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Enseignant</Label>
                      <p>{selectedCreneau.utilisateur.prenom} {selectedCreneau.utilisateur.nom}</p>
                    </div>
                  )}
                </>
              )}
              
              {selectedCreneau.statut === 'disponible' && (
                <p>Ce créneau est disponible pour une réservation.</p>
              )}
              
              {selectedCreneau.statut === 'passe' && (
                <p>Ce créneau est passé et n'est plus disponible.</p>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsDetailsOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendrier;
