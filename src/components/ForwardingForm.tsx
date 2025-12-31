import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ForwardingOption, ForwardingType } from "@/types/telephony";
import { showSuccess, showError } from "@/utils/toast";
import { Trash2, Save } from "lucide-react";

interface ForwardingFormProps {
  type: ForwardingType;
  label: string;
  currentOption: ForwardingOption;
  onUpdate: (type: ForwardingType, destination: string | null) => Promise<void>;
  disabled: boolean;
}

const ForwardingForm: React.FC<ForwardingFormProps> = ({
  type,
  label,
  currentOption,
  onUpdate,
  disabled,
}) => {
  const [destination, setDestination] = useState(currentOption.destination || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setDestination(currentOption.destination || "");
  }, [currentOption.destination]);

  // Simple validation: check if it looks like a phone number (digits only, min length 8)
  const isValidNumber = (num: string) => {
    const cleaned = num.replace(/[^0-9+]/g, "");
    return cleaned.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedDestination = destination.trim().replace(/[^0-9+]/g, "");

    if (!cleanedDestination) {
      showError("Veuillez saisir un numéro ou utiliser le bouton de désactivation.");
      return;
    }

    if (!isValidNumber(cleanedDestination)) {
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
    if (!currentOption.active) return;

    if (!window.confirm(`Êtes-vous sûr de vouloir désactiver le ${label} ?`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(type, null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDestinationChanged = destination.trim() !== (currentOption.destination || "");

  return (
    <Card className="p-4 shadow-lg">
      <h3 className="text-md font-semibold mb-3">{label}</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor={`dest-${type}`}>Numéro de destination</Label>
          <Input
            id={`dest-${type}`}
            type="tel"
            placeholder="Ex: 0033612345678"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            disabled={disabled || isSubmitting}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Format national (06...) ou international (00336...).
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            type="submit"
            className="flex-1 bg-primary hover:bg-primary/90"
            disabled={disabled || isSubmitting || !isDestinationChanged || !isValidNumber(destination)}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Sauvegarde..." : "Enregistrer"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDisable}
            disabled={disabled || isSubmitting || !currentOption.active}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ForwardingForm;