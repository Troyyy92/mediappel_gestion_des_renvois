import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SavedNumber } from "@/types/telephony";
import { List, Trash2, X, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface SavedNumbersManagerProps {
  savedNumbers: SavedNumber[];
  removeNumber: (id: string) => void;
}

const SavedNumbersManager: React.FC<SavedNumbersManagerProps> = ({
  savedNumbers,
  removeNumber,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [numberToDelete, setNumberToDelete] = useState<SavedNumber | null>(null);

  const handleDeleteClick = (num: SavedNumber) => {
    setNumberToDelete(num);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteNumber = () => {
    if (numberToDelete) {
      removeNumber(numberToDelete.id);
      setShowDeleteConfirm(false);
      setNumberToDelete(null);
    }
  };

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full mt-2">
            <List className="w-4 h-4 mr-2" />
            Gérer les numéros enregistrés
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Gérer les numéros enregistrés</DialogTitle>
          </DialogHeader>
          <Separator />
          <div className="max-h-[60vh] overflow-y-auto space-y-2 py-2">
            {savedNumbers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Aucun numéro enregistré pour le moment.
              </p>
            ) : (
              savedNumbers.map((num) => (
                <div
                  key={num.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div>
                    <div className="font-medium text-sm">{num.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{num.number}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(num)}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    title={`Supprimer ${num.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal for Deletion */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le numéro enregistré "{numberToDelete?.name}" ({numberToDelete?.number}) ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteNumber}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SavedNumbersManager;