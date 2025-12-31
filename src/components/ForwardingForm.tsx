import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ForwardingOption, ForwardingType, SavedNumber } from "@/types/telephony";
import { showSuccess, showError } from "@/utils/toast";
import { Trash2, Save, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
}) => {
  const [destination, setDestination] = useState(currentOption.destination || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSavedName, setNewSavedName] = useState("");
  const [isSavingNew, setIsSavingNew] = useState(false);

  useEffect(() => {
    setDestination(currentOption.destination || "");
  }, [currentOption.destination]);

  // Simple validation: check if it looks like a phone number (digits only, min length 3)
  const isValidNumber = (num: string) => {
    const cleaned = num.trim().replace(/[^0-9+]/g, "");
    return cleaned.length >= 3;
  };

  const cleanedDestination = destination.trim().replace(/[^0-9+]/g, "");
  const isDestinationChanged = cleanedDestination !== (currentOption.destination || "");
  const isNumberValid = isValidNumber(cleanedDestination);
  const canSubmit = isDestinationChanged && isNumberValid;
  const canSaveQuick = isNumberValid && !savedNumbers.some(n => n.number === cleanedDestination);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cleanedDestination) {
      showError("Veuillez saisir un numéro ou utiliser le bouton de désactivation.");
      return;
    }

    if (!isNumberValid) {
      showError("Le numéro de destination semble invalide.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(type, cleanedDestination);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisable = async () => {
    if (!currentOption.active && !currentOption.destination) return;

    if (!window.confirm(`Êtes-vous sûr de vouloir désactiver le ${label} ?`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(type, null);
      setDestination(""); // Clear input after disabling
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectChange = (value: string) => {
    // Set the destination from the selected saved number
    setDestination(value);
    setIsSavingNew(false); // Hide quick save form if a saved number is selected
  };

  const handleQuickSave = () => {
    if (!isNumberValid) {
        showError("Veuillez saisir un numéro valide avant de l'enregistrer.");
        return;
    }
    setIsSavingNew(true);
    setNewSavedName(""); // Reset name field
  };

  const handleSaveNewNumber = (e: React.FormEvent) => {
    e.preventDefault();
    if (addSavedNumber(newSavedName, cleanedDestination)) {
        // Crucial: Update the local destination state to the cleaned version
        // This ensures the Select component correctly identifies the newly saved number
        setDestination(cleanedDestination); 
        setIsSavingNew(false);
        setNewSavedName("");
    }
  };
  
  // Determine the current value for the Select component
  const currentSavedNumber = savedNumbers.find(n => n.number === cleanedDestination)?.number || "";

  const handleRemoveSavedNumber = (id: string) => {
    const numberToRemove = savedNumbers.find(n => n.id === id)?.number;
    removeSavedNumber(id);
    // If the deleted number was the current destination, clear the input
    if (destination === numberToRemove) {
        setDestination("");
    }
  };

  return (
    <Card className="p-4 shadow-lg">
      <h3 className="text-md font-semibold mb-3">{label}</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* 1. Quick Select */}
        {savedNumbers.length > 0 && (
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
            <Separator />
          </div>
        )}

        {/* 2. Manual Input */}
        <div className="space-y-1">
          <Label htmlFor={`dest-${type}`}>Numéro de destination</Label>
          <Input
            id={`dest-${type}`}
            type="tel"
            placeholder="Ex: 0033612345678"
            value={destination}
            onChange={(e) => {
                setDestination(e.target.value);
                setIsSavingNew(false); // Hide quick save form if user starts typing
            }}
            disabled={disabled || isSubmitting}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Format national (06...) ou international (00336...).
          </p>
        </div>

        {/* 3. Quick Save Form */}
        {isSavingNew && isNumberValid && (
            <Card className="p-3 bg-gray-50 dark:bg-gray-900 border">
                <form onSubmit={handleSaveNewNumber} className="space-y-2">
                    <Label htmlFor={`save-name-${type}`} className="text-xs font-semibold">
                        Nom pour l'enregistrement rapide
                    </Label>
                    <Input
                        id={`save-name-${type}`}
                        value={newSavedName}
                        onChange={(e) => setNewSavedName(e.target.value)}
                        placeholder="Ex: Mobile de secours"
                        required
                    />
                    <Button type="submit" size="sm" className="w-full" disabled={!newSavedName.trim()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Enregistrer {cleanedDestination}
                    </Button>
                </form>
            </Card>
        )}

        {/* 4. Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button
            type="submit"
            className="flex-1 bg-primary hover:bg-primary/90"
            disabled={disabled || isSubmitting || !canSubmit}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Sauvegarde..." : "Appliquer le renvoi"}
          </Button>
          
          {canSaveQuick && !isSavingNew && (
            <Button
                type="button"
                variant="outline"
                onClick={handleQuickSave}
                disabled={disabled || isSubmitting}
                title="Enregistrer ce numéro pour une sélection rapide future"
            >
                <Plus className="w-4 h-4" />
            </Button>
          )}

          <Button
            type="button"
            variant="destructive"
            onClick={handleDisable}
            disabled={disabled || isSubmitting || (!currentOption.active && !currentOption.destination)}
            title="Désactiver le renvoi"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ForwardingForm;