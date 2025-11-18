import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { format, isBefore, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Edit, Eye } from "lucide-react";
import { Reservation } from '@/types';
import { useToast } from "@/hooks/use-toast";

const Reservations: React.FC = () => {
  const { reservations, filieres, updateReservation, getCreneauById } = useApp();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAxePedagogique, setEditAxePedagogique] = useState('');
  const [editSalle, setEditSalle] = useState('');

  // Filtrer les réservations de l'utilisateur connecté
  const userReservations = reservations.filter(r => r.utilisateur_id === currentUser?.id);

  // Séparer réservations à venir et passées
  const now = new Date();
  const reservationsAvenir = userReservations.filter(r => {
    const reservationDate = parseISO(r.date);
    return !isBefore(reservationDate, now);
  });

  const reservationsPassees = userReservations.filter(r => {
    const reservationDate = parseISO(r.date);
    return isBefore(reservationDate, now);
  });

  // Ouvrir la modal de détails
  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDetailsOpen(true);
  };

  // Ouvrir la modal de modification
  const handleEdit = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setEditTitle(reservation.titre_module);
    setEditDescription(reservation.description);
    setEditAxePedagogique(reservation.axe_pedagogique || '');
    setEditSalle(reservation.salle || '');
    setIsEditOpen(true);
  };

  // Ensure teacher info is in description when editing
  useEffect(() => {
    if (isEditOpen && selectedReservation && currentUser) {
      const teacherInfo = `Module présenté par ${currentUser.prenom} ${currentUser.nom}\n\n`;

      // Only add teacher info if it's not already there
      if (!editDescription.includes(teacherInfo)) {
        setEditDescription(teacherInfo + editDescription);
      }
    }
  }, [isEditOpen, selectedReservation, currentUser, editDescription]);

  // Soumettre les modifications d'une réservation
  const handleEditSubmit = async () => {
    if (!selectedReservation) return;

    if (!editTitle || !editDescription) {
      toast({
        title: "Champs obligatoires",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    // Ensure teacher info is in description
    let finalDescription = editDescription;
    if (currentUser) {
      const teacherInfo = `Module présenté par ${currentUser.prenom} ${currentUser.nom}\n\n`;
      if (!finalDescription.includes(teacherInfo)) {
        finalDescription = teacherInfo + finalDescription;
      }
    }

    try {
      await updateReservation(selectedReservation.id, {
        titre_module: editTitle,
        description: finalDescription,
        axe_pedagogique: editAxePedagogique || undefined,
        salle: editSalle || undefined,
      });

      setIsEditOpen(false);
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      // Le toast est déjà géré dans la fonction updateReservation du contexte
    }
  };

  // Formatter l'affichage d'une réservation dans le tableau
  const getReservationDetails = (reservation: Reservation) => {
    const filiere = filieres.find(f => f.id === reservation.filiere_id);
    const creneau = getCreneauById(reservation.creneau_id);

    return {
      date: format(parseISO(reservation.date), 'dd MMMM yyyy', { locale: fr }),
      horaire: creneau ? `${creneau.heure_debut} - ${creneau.heure_fin}` : 'Horaire inconnu',
      filiere: filiere ? filiere.nom : 'Filière inconnue',
      jour: creneau ? creneau.jour_semaine : 'Jour inconnu',
    };
  };

  // Générer les lignes du tableau pour un ensemble de réservations
  const renderReservationsTable = (reservationsList: Reservation[], showActions: boolean) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Horaire</TableHead>
          <TableHead>Filière</TableHead>
          <TableHead>Module</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reservationsList.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
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

                    {showActions && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(reservation)}
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Mes réservations</h1>
        <p className="text-muted-foreground">Gérez vos réservations de modules</p>
      </div>

      <Tabs defaultValue="future">
        <TabsList>
          <TabsTrigger value="future">À venir ({reservationsAvenir.length})</TabsTrigger>
          <TabsTrigger value="past">Historique ({reservationsPassees.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="future" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Réservations à venir</CardTitle>
              <CardDescription>
                Liste de vos réservations futures
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderReservationsTable(reservationsAvenir, true)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des réservations</CardTitle>
              <CardDescription>
                Liste de vos réservations passées
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderReservationsTable(reservationsPassees, false)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de détails */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails de la réservation</DialogTitle>
          </DialogHeader>

          {selectedReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Date</Label>
                  <p>{getReservationDetails(selectedReservation).date}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Jour</Label>
                  <p>{getReservationDetails(selectedReservation).jour}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Horaire</Label>
                  <p>{getReservationDetails(selectedReservation).horaire}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Filière</Label>
                  <p>{getReservationDetails(selectedReservation).filiere}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Titre du module</Label>
                <p className="font-medium">{selectedReservation.titre_module}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Description</Label>
                <p className="whitespace-pre-line">{selectedReservation.description}</p>
              </div>

              {selectedReservation.axe_pedagogique && (
                <div>
                  <Label className="text-sm text-muted-foreground">Axe pédagogique</Label>
                  <p>{selectedReservation.axe_pedagogique}</p>
                </div>
              )}

              {selectedReservation.salle && (
                <div>
                  <Label className="text-sm text-muted-foreground">Salle</Label>
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

      {/* Modal de modification */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier la réservation</DialogTitle>
          </DialogHeader>

          {selectedReservation && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>
                  {getReservationDetails(selectedReservation).date}, {getReservationDetails(selectedReservation).horaire}
                </span>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-titre" className="required">Titre du module</Label>
                <Input
                  id="edit-titre"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description" className="required">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-axe-pedagogique">Axe pédagogique</Label>
                <Input
                  id="edit-axe-pedagogique"
                  value={editAxePedagogique}
                  onChange={(e) => setEditAxePedagogique(e.target.value)}
                  placeholder="Ex: Consolidation et renforcement disciplinaire, Consolidation et renforcement de la méthodologie, Développement des compétences psychosociales"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-salle">Demande de salle (optionnel)</Label>
                <Input
                  id="edit-salle"
                  value={editSalle}
                  onChange={(e) => setEditSalle(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditSubmit}>
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reservations;
