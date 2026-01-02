"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ForwardingOption, ForwardingType, SavedNumber } from "@/types/telephony";
import { showError } from "@/utils/toast";
import { Trash2, Save, Plus, Check, RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import SavedNumberSelectItem from "./SavedNumberSelectItem";

interface ForwardingFormProps {
  type: ForwardingType;
  label: string;
  currentOption: ForwardingOption;
  onUpdate: (type: ForwardingType, destination: string | null) => Promise<void>;
  disabled: boolean;
  savedNumbers: SavedNumber[];
  addSavedNumber: (name: string, number: string) => boolean;
  removeSavedNumber: (id: string) => void;
  onUndo?: () => Promise<void>;
  canUndo?: boolean;
}

const ForwardingForm: React.FC<ForwardingFormProps> = ({
  type,
  label,
  currentOption,
  onUpdate,
  disabled,
  savedNumbers,
  addSavedNumber,
  removeSavedNumber,
  onUndo,
  canUndo = false,
}) => {
  const isVoicemailType = type === "busy" || type === "noReply";
  const [destination, setDestination] = useState(currentOption.destination || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSavedName, setNewSavedName] = useState("");
  const [isSavingNew, setIsSavingNew] = useState(false);
  
  // États pour la confirmation
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<"activate" | "deactivate">("activate");

  useEffect(() => {
    setDestination(currentOption.destination || "");
  }, [currentOption.destination]);

  const isValidNumber = (num: string) => {
    const cleaned = num.trim().replace(/[^0-9+]/g, "");
    return cleaned.length >= 3;
  };

  const cleanedDestination = destination.trim().replace(/[^0-9+]/g, "");
  const isNumberValid = isVoicemailType ? true : isValidNumber(cleanedDestination);
  const isDestinationChanged = isVoicemailType 
    ? !currentOption.active 
    : cleanedDestination !== (currentOption.destination || "");

  const canSubmit = isVoicemailType ? !currentOption.active : (isDestinationChanged && isNumberValid);

  const executeUpdate = async (dest: string | null) => {
    setIsSubmitting(true);
    try {
      await onUpdate(type, dest);
      if (dest === null) {
        setDestination("");
      }
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVoicemailType && !cleanedDestination) {
      showError("Veuillez saisir un numéro.");
      return;
    }

    if (type === "unconditional") {
      setConfirmType("activate");
      setShowConfirm(true);
    } else {
      executeUpdate(isVoicemailType ? (currentOption.destination || "voicemail") : cleanedDestination);
    }
  };

  const handleDisable = () => {
    if (!currentOption.active || isVoicemailType) return;
    
    if (type === "unconditional") {
      setConfirmType("deactivate");
      setShowConfirm(true);
    } else {
      if (window.confirm(`Êtes-vous sûr de vouloir désactiver le ${label} ?`)) {
        executeUpdate(null);
      }
    }
  };

  const handleSelectChange = (value: string) => {
    setDestination(value);
    setIsSavingNew(false);
  };

  const handleQuickSave = () => {
    setIsSavingNew(true);
    setNewSavedName("");
  };

  const handleSaveNewNumber = (e: React.FormEvent) => {
    e.preventDefault();
    if (addSavedNumber(newSavedName, cleanedDestination)) {
        setDestination(cleanedDestination); 
        setIsSavingNew(false);
        setNewSavedName("");
    }
  };
  
  const currentSavedNumber = savedNumbers.find(n => n.number === cleanedDestination)?.number || "";

  const handleRemoveSavedNumber = (id: string) => {
    const numberToRemove = savedNumbers.find(n => n.id === id)?.number;
    removeSavedNumber(id);
    if (destination === numberToRemove) {
        setDestination("");
    }
  };

  return (
    <>
      <Card className="p-4 shadow-lg flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-md font-semibold">{label}</h3>
          {type === "unconditional" && canUndo && onUndo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={disabled || isSubmitting}
              className="h-7 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              title="Annuler la dernière action"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Annuler
            </Button>
          )}
        </div>
        
        <div className="space-y-3 flex-grow">
          {!isVoicemailType && savedNumbers.length > 0 && (
            <div className="space-y-1">
              <Label htmlFor={`select-dest-${type}`}>Numéros enregistrés</Label>
              <Select onValueChange={handleSelectChange} value={currentSavedNumber}>
                <SelectTrigger id={`select-dest-${type}`} disabled={disabled || isSubmitting}>
                  <SelectValue placeholder="Choisir un numéro rapide..." />
                </SelectTrigger>
                <SelectContent>
                  {savedNumbers.map((num) => (
                      <SavedNumberSelectItem 
                          key={num.id} 
                          num={num} 
                          onRemove={handleRemoveSavedNumber} 
                      />
                  ))}
                </SelectContent>
              </Select>
              <Separator className="my-2" />
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor={`dest-${type}`}>Numéro de destination</Label>
            <Input
              id={`dest-${type}`}
              type="text"
              value={isVoicemailType ? "Répondeur" : destination}
              onChange={(e) => !isVoicemailType && setDestination(e.target.value)}
              disabled={disabled || isSubmitting || isVoicemailType}
              className={`w-full ${isVoicemailType ? "bg-gray-100 font-medium text-primary cursor-not-allowed" : ""}`}
              readOnly={isVoicemailType}
            />
          </div>

          {!isVoicemailType && isSavingNew && isNumberValid && (
              <Card className="p-3 bg-gray-50 dark:bg-gray-900 border">
                  <form onSubmit={handleSaveNewNumber} className="space-y-2">
                      <Label htmlFor={`save-name-${type}`} className="text-xs font-semibold">Nom</Label>
                      <Input
                          id={`save-name-${type}`}
                          value={newSavedName}
                          onChange={(e) => setNewSavedName(e.target.value)}
                          required
                      />
                      <Button type="submit" size="sm" className="w-full" disabled={!newSavedName.trim()}>
                          <Plus className="w-4 h-4 mr-2" /> Enregistrer
                      </Button>
                  </form>
              </Card>
          )}
        </div>

        <div className="flex space-x-2 pt-4 mt-auto">
          <Button
            type="button"
            onClick={handleSubmit}
            className="flex-1"
            disabled={disabled || isSubmitting || (isVoicemailType ? currentOption.active : !canSubmit)}
          >
            {isVoicemailType && currentOption.active ? (
              <><Check className="w-4 h-4 mr-2" /> Activé</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> {isSubmitting ? "Sauvegarde..." : "Activer"}</>
            )}
          </Button>
          
          {!isVoicemailType && (
            <>
              {isNumberValid && !savedNumbers.some(n => n.number === cleanedDestination) && !isSavingNew && (
                <Button type="button" variant="outline" onClick={handleQuickSave} disabled={disabled || isSubmitting}>
                  <Plus className="w-4 h-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="destructive"
                onClick={handleDisable}
                disabled={disabled || isSubmitting || !currentOption.active}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmType === "activate" ? "Confirmer l'activation" : "Confirmer la désactivation"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmType === "activate" 
                ? `Voulez-vous vraiment activer le renvoi inconditionnel vers le numéro ${cleanedDestination} ? Tous les appels seront redirigés immédiatement.`
                : "Voulez-vous vraiment désactiver le renvoi inconditionnel ? Vos appels ne seront plus redirigés."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => executeUpdate(confirmType === "activate" ? cleanedDestination : null)}
              className={confirmType === "activate" ? "bg-primary" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ForwardingForm;