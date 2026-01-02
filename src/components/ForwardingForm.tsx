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
  const isVoicemailType = type === "busy" || type === "noReply";
  const [destination, setDestination] = useState(currentOption.destination || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSavedName, setNewSavedName] = useState("");
  const [isSavingNew, setIsSavingNew] = useState(false);

  useEffect(() => {
    setDestination(currentOption.destination || "");
  }, [currentOption.destination]);

  const isValidNumber = (num: string) => {
    const cleaned = num.trim().replace(/[^0-9+]/g, "");
    return cleaned.length >= 3;
  };

  const cleanedDestination = destination.trim().replace(/[^0-9+]/g, "");
  
  // Pour les types "Répondeur", on considère que c'est toujours valide si on veut juste activer/désactiver
  const isNumberValid = isVoicemailType ? true : isValidNumber(cleanedDestination);
  
  // Le changement est détecté si l'état actif change ou si le numéro change (uniquement pour unconditional)
  const isDestinationChanged = isVoicemailType 
    ? !currentOption.active 
    : cleanedDestination !== (currentOption.destination || "");

  const canSubmit = isVoicemailType ? !currentOption.active : (isDestinationChanged && isNumberValid);
  const canSaveQuick = !isVoicemailType && isNumberValid && !savedNumbers.some(n => n.number === cleanedDestination);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isVoicemailType && !cleanedDestination) {
      showError("Veuillez saisir un numéro ou utiliser le bouton de désactivation.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Pour le répondeur, on utilise le numéro actuel ou une chaîne vide si OVH le gère par défaut
      await onUpdate(type, isVoicemailType ? (currentOption.destination || "voicemail") : cleanedDestination);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisable = async () => {
    if (!currentOption.active) return;

    if (!window.confirm(`Êtes-vous sûr de vouloir désactiver le ${label} ?`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(type, null);
      if (!isVoicemailType) setDestination("");
    } finally {
      setIsSubmitting(false);
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
    <Card className="p-4 shadow-lg flex flex-col h-full">
      <h3 className="text-md font-semibold mb-3">{label}</h3>
      <div className="space-y-3 flex-grow">
        
        {/* 1. Quick Select (Masqué pour le répondeur) */}
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

        {/* 2. Manual Input */}
        <div className="space-y-1">
          <Label htmlFor={`dest-${type}`}>Numéro de destination</Label>
          <Input
            id={`dest-${type}`}
            type="text"
            placeholder={isVoicemailType ? "" : "Ex: 0033612345678"}
            value={isVoicemailType ? "Répondeur" : destination}
            onChange={(e) => {
                if (!isVoicemailType) {
                    setDestination(e.target.value);
                    setIsSavingNew(false);
                }
            }}
            disabled={disabled || isSubmitting || isVoicemailType}
            className={`w-full ${isVoicemailType ? "bg-gray-100 font-medium text-primary cursor-not-allowed" : ""}`}
            readOnly={isVoicemailType}
          />
          {!isVoicemailType && (
            <p className="text-xs text-muted-foreground">
              Format national (06...) ou international (00336...).
            </p>
          )}
        </div>

        {/* 3. Quick Save Form (Masqué pour le répondeur) */}
        {!isVoicemailType && isSavingNew && isNumberValid && (
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
      </div>

      {/* 4. Action Buttons */}
      <div className="flex space-x-2 pt-4 mt-auto">
        <Button
          type="button"
          onClick={handleSubmit}
          className="flex-1 bg-primary hover:bg-primary/90"
          disabled={disabled || isSubmitting || !canSubmit}
        >
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? "Sauvegarde..." : currentOption.active ? "Déjà activé" : "Activer"}
        </Button>
        
        {canSaveQuick && !isSavingNew && (
          <Button
              type="button"
              variant="outline"
              onClick={handleQuickSave}
              disabled={disabled || isSubmitting}
              title="Enregistrer ce numéro"
          >
              <Plus className="w-4 h-4" />
          </Button>
        )}

        <Button
          type="button"
          variant="destructive"
          onClick={handleDisable}
          disabled={disabled || isSubmitting || !currentOption.active}
          title="Désactiver le renvoi"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default ForwardingForm;