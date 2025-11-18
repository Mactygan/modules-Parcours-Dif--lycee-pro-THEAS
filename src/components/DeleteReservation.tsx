import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext"; // Chemin corrigé
import { Reservation } from "@/types"; // Vérifiez que ce chemin est correct
import { Trash2 } from "lucide-react";

interface DeleteReservationProps {
  reservation: Reservation;
  onDeleteSuccess?: () => void;
}

export const DeleteReservation: React.FC<DeleteReservationProps> = ({
  reservation,
  onDeleteSuccess
}) => {
  const { deleteReservation } = useApp();
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      // Appel à votre fonction deleteReservation
      const success = await deleteReservation(reservation.id);

      if (success) {
        // Fermer le dialogue seulement après la suppression réussie
        setDialogOpen(false);

        // Exécuter la callback si elle existe
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setDialogOpen(true)}
        >
          <Trash2 className="mr-1" size={16} /> Supprimer
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer cette réservation ?
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              // Empêcher la fermeture automatique du dialogue
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
