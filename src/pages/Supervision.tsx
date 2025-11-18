import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { format, addDays, subDays, startOfWeek, endOfWeek, isToday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Eye,
  Edit,
  Trash2,
  Lock,
  Unlock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreneauAffichage, JourSemaine, Reservation } from '@/types';

const Supervision: React.FC = () => {
  const { 
    filieres, 
    users,
    selectedFiliere, 
    setSelectedFiliere, 
    selectedDate, 
    setSelectedDate, 
    creneauxAffichage,
    reservations,
    updateReservation,
    deleteReservation,
    getCreneauById,
    getFiliereById
  } = useApp();
  
  const { toast } = useToast();
  
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

  // Navigation temporelle
  const goToPreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Calcul des jours de la semaine
  const monday = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const friday = addDays(monday, 4);
  
  const weekDays = [];
  for (let i = 0; i < 5; i++) {
    weekDays.push(addDays(monday, i));
  }

  // Créneaux horaires uniques
  const creneauxHoraires = Array.from(new Set(creneauxAffichage.map(c => `${c.heure_debut}-${c.heure_fin}`)))
    .sort()
    .map(horaire => {
      const [debut, fin] = horaire.split('-');
      return { debut, fin };
    });

  // Fonction pour obtenir un créneau par jour et horaire
  const getCreneauByDayAndTime = (jour: JourSemaine, debut: string, fin: string): CreneauAffichage | undefined => {
    return creneauxAffichage.find(c => 
      c.jour_semaine === jour && 
      c.heure_debut === debut && 
      c.heure_fin === fin
    );
  };

  // Changement de filière
  const handleFiliereChange = (filiereId: string) => {
    const filiere = filieres.find(f => f.id === filiereId) || null;
    setSelectedFiliere(filiere);
  };

  // Confirmer la suppression d'une réservation
  const handleDeleteConfirm = () => {
    if (!selectedReservation) return;
    deleteReservation(selectedReservation.id);
    setIsDeleteOpen(false);
  };

  // Bloquer/débloquer un créneau (simulé)
  const handleToggleBlock = (creneau: CreneauAffichage) => {
    toast({
      title: creneau.statut === 'disponible' ? 'Créneau bloqué' : 'Créneau débloqué',
      description: `Le créneau ${creneau.jour_semaine} ${creneau.heure_debut}-${creneau.heure_fin} a été ${creneau.statut === 'disponible' ? 'bloqué' : 'débloqué'} avec succès.`,
    });
  };

  // Afficher les détails d'une réservation
  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDetailsOpen(true);
  };

  // Supprimer une réservation
  const handleDeleteReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDeleteOpen(true);
  };

  // Obtenir les détails d'une réservation
  const getReservationDetails = (reservation: Reservation) => {
    const filiere = getFiliereById(reservation.filiere_id);
    const creneau = getCreneauById(reservation.creneau_id);
    const utilisateur = users.find(u => u.id === reservation.utilisateur_id);
    
    return {
      date: format(parseISO(reservation.date), 'dd MMMM yyyy', { locale: fr }),
      horaire: creneau ? `${creneau.heure_debut} - ${creneau.heure_fin}` : 'Horaire inconnu',
      filiere: filiere ? filiere.nom : 'Filière inconnue',
      jour: creneau ? creneau.jour_semaine : 'Jour inconnu',
      utilisateur: utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : 'Utilisateur inconnu',
    };
  };

  // Récupérer les réservations pour la semaine actuelle
  const weekReservations = reservations.filter(r => {
    const reservationDate = parseISO(r.date);
    return reservationDate >= monday && reservationDate <= friday;
  });

  // Récupérer les réservations pour le jour sélectionné
  const selectedDayIndex = selectedDate.getDay() - 1;
  const selectedDayName = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'][selectedDayIndex >= 0 ? selectedDayIndex : 0] as JourSemaine;
  const selectedDayStr = format(selectedDate, 'yyyy-MM-dd');
  
  const dayReservations = reservations.filter(r => r.date === selectedDayStr);

  // Obtenir le nom du jour et sa date
  const getHeaderDateLabel = (date: Date) => {
    const isCurrentDay = isToday(date);
    return (
      <div className={`text-center font-medium ${isCurrentDay ? 'text-primary' : ''}`}>
        <div>{format(date, 'EEEE', { locale: fr })}</div>
        <div className={`text-sm ${isCurrentDay ? 'bg-primary text-primary-foreground rounded-full px-2 inline-block' : 'text-muted-foreground'}`}>
          {format(date, 'dd MMM', { locale: fr })}
        </div>
      </div>
    );
  };

  // Rendu des lignes du tableau pour les réservations
  const renderReservationsTable = (reservationsList: Reservation[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Horaire</TableHead>
          <TableHead>Filière</TableHead>
          <TableHead>Module</TableHead>
          <TableHead>Enseignant</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reservationsList.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
              Aucune réservation trouvée
            </TableCell>
          </TableRow>
        ) : (
          reservationsList.map(reservation => {
            const details = getReservationDetails(reservation);
            return (
              <TableRow key={reservation.id}>
                <TableCell>{details.date}</TableCell>
                <TableCell>{details.horaire}</TableCell>
                <TableCell>{details.filiere}</TableCell>
                <TableCell>{reservation.titre_module}</TableCell>
                <TableCell>{details.utilisateur}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleViewDetails(reservation)}
                      title="Voir les détails"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteReservation(reservation)}
                      className="text-destructive"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <h1 className="text-2xl font-semibold">Supervision du planning</h1>
        
        {/* Sélecteur de filière */}
        <div className="flex items-center space-x-2">
          <label htmlFor="filiere" className="text-sm">Filière :</label>
          <Select
            value={selectedFiliere?.id || ""}
            onValueChange={handleFiliereChange}
          >
            <SelectTrigger className="w-48">
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
        </div>
      </div>

      {/* Navigation temporelle */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          {viewMode === 'week' ? 'Semaine précédente' : 'Jour précédent'}
        </Button>
        
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={goToToday} className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Aujourd'hui
            </Button>
            <TabsList>
              <TabsTrigger value="week" onClick={() => setViewMode('week')}>Semaine</TabsTrigger>
              <TabsTrigger value="day" onClick={() => setViewMode('day')}>Jour</TabsTrigger>
            </TabsList>
          </div>
          <span className="text-sm font-medium">
            {viewMode === 'week' 
              ? `Semaine du ${format(monday, 'd MMMM', { locale: fr })} au ${format(friday, 'd MMMM yyyy', { locale: fr })}`
              : `${format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}`
            }
          </span>
        </div>
        
        <Button variant="outline" size="sm" onClick={goToNextWeek}>
          {viewMode === 'week' ? 'Semaine suivante' : 'Jour suivant'}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Contenu selon le mode d'affichage */}
      <Tabs value={viewMode} onValueChange={(val) => setViewMode(val as 'week' | 'day')}>
        <TabsContent value="week" className="mt-0">
          {/* Grille du calendrier hebdomadaire */}
          <div className="rounded-md border">
            {/* En-tête avec les jours */}
            <div className="grid grid-cols-5 gap-px bg-muted">
              {weekDays.map((day, index) => (
                <div key={index} className="bg-background p-2">
                  {getHeaderDateLabel(day)}
                </div>
              ))}
            </div>

            {/* Corps du calendrier avec les créneaux */}
            <div className="divide-y">
              {creneauxHoraires.map(({ debut, fin }, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-5 gap-px bg-muted">
                  {weekDays.map((day, colIndex) => {
                    const jourSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'][colIndex] as JourSemaine;
                    const creneau = getCreneauByDayAndTime(jourSemaine, debut, fin);
                    
                    // Si le créneau n'existe pas pour ce jour (ex: mercredi après-midi)
                    if (!creneau) {
                      return (
                        <div 
                          key={colIndex} 
                          className="bg-background p-2 min-h-[80px] flex items-center justify-center"
                        >
                          <span className="text-muted-foreground text-sm">Indisponible</span>
                        </div>
                      );
                    }
                    
                    // Définir les styles et le contenu en fonction du statut
                    let bgColor = 'bg-background';
                    let content = null;
                    
                    switch (creneau.statut) {
                      case 'disponible':
                        bgColor = 'bg-background';
                        content = (
                          <div className="h-full flex flex-col border-l-4 border-creneauDisponible">
                            <div className="flex items-center justify-between">
                              <span className="text-creneauDisponible font-medium">Disponible</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleToggleBlock(creneau)}
                                title="Bloquer le créneau"
                                className="h-6 w-6"
                              >
                                <Lock className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                        break;
                      case 'reserve':
                        bgColor = 'bg-background';
                        content = (
                          <div className="h-full flex flex-col border-l-4 border-creneauReserve p-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-creneauReserve">{creneau.reservation?.titre_module}</span>
                              <div className="flex">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => creneau.reservation && handleViewDetails(creneau.reservation)}
                                  title="Voir les détails"
                                  className="h-6 w-6"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => creneau.reservation && handleDeleteReservation(creneau.reservation)}
                                  title="Supprimer"
                                  className="h-6 w-6 text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground truncate">
                              {creneau.reservation?.salle && `Salle: ${creneau.reservation.salle}`}
                            </span>
                            {creneau.utilisateur && (
                              <span className="text-xs mt-auto text-muted-foreground">
                                {creneau.utilisateur.prenom} {creneau.utilisateur.nom}
                              </span>
                            )}
                          </div>
                        );
                        break;
                      case 'passe':
                        bgColor = 'bg-background opacity-60';
                        content = (
                          <div className="h-full flex flex-col border-l-4 border-creneauPasse">
                            <div className="flex items-center justify-between">
                              <span className="text-creneauPasse">Passé</span>
                              {creneau.reservation && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => creneau.reservation && handleViewDetails(creneau.reservation)}
                                  title="Voir les détails"
                                  className="h-6 w-6"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            {creneau.reservation && (
                              <>
                                <span className="text-creneauPasse font-medium">{creneau.reservation.titre_module}</span>
                                {creneau.utilisateur && (
                                  <span className="text-xs mt-auto text-muted-foreground">
                                    {creneau.utilisateur.prenom} {creneau.utilisateur.nom}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        );
                        break;
                    }
                    
                    return (
                      <div 
                        key={colIndex} 
                        className={`${bgColor} p-2 min-h-[80px]`}
                      >
                        <div className="text-xs text-muted-foreground mb-1">
                          {debut} - {fin}
                        </div>
                        {content}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Liste des réservations de la semaine */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Réservations de la semaine</CardTitle>
            </CardHeader>
            <CardContent>
              {renderReservationsTable(weekReservations)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="day" className="mt-0">
          {/* Vue du jour sélectionné */}
          <Card>
            <CardHeader>
              <CardTitle>
                Réservations du {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderReservationsTable(dayReservations)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de détails de réservation */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails de la réservation</DialogTitle>
          </DialogHeader>
          
          {selectedReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Date</label>
                  <p>{getReservationDetails(selectedReservation).date}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Jour</label>
                  <p>{getReservationDetails(selectedReservation).jour}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Horaire</label>
                  <p>{getReservationDetails(selectedReservation).horaire}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Filière</label>
                  <p>{getReservationDetails(selectedReservation).filiere}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground">Enseignant</label>
                <p>{getReservationDetails(selectedReservation).utilisateur}</p>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground">Titre du module</label>
                <p className="font-medium">{selectedReservation.titre_module}</p>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground">Description</label>
                <p className="whitespace-pre-line">{selectedReservation.description}</p>
              </div>
              
              {selectedReservation.salle && (
                <div>
                  <label className="text-sm text-muted-foreground">Salle</label>
                  <p>{selectedReservation.salle}</p>
                </div>
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

      {/* Modal de suppression de réservation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Supprimer la réservation</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          
          {selectedReservation && (
            <div className="py-4">
              <p className="font-medium">{selectedReservation.titre_module}</p>
              <p className="text-sm text-muted-foreground">
                {getReservationDetails(selectedReservation).date}, {getReservationDetails(selectedReservation).horaire}
              </p>
              <p className="text-sm text-muted-foreground">
                Enseignant: {getReservationDetails(selectedReservation).utilisateur}
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Légende */}
      <div className="flex flex-wrap gap-4 items-center justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-creneauDisponible rounded-full"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-creneauReserve rounded-full"></div>
          <span>Réservé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-creneauPasse rounded-full"></div>
          <span>Passé</span>
        </div>
      </div>
    </div>
  );
};

export default Supervision;
