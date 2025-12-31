import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card"; // Added import
import { showSuccess, showError } from "@/utils/toast";

interface NoReplyTimerFormProps {
  currentTimer: number;
  onUpdate: (timer: number) => Promise<void>;
  disabled: boolean;
}

const NoReplyTimerForm: React.FC<NoReplyTimerFormProps> = ({
  currentTimer,
  onUpdate,
  disabled,
}) => {
  const [timer, setTimer] = useState(currentTimer.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTimer(currentTimer.toString());
  }, [currentTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTimer = parseInt(timer, 10);

    if (isNaN(newTimer) || newTimer < 0 || newTimer > 60) {
      showError("Le délai doit être un nombre entier entre 0 et 60 secondes.");
      return;
    }

    if (newTimer === currentTimer) {
      showError("Le nouveau délai est identique au délai actuel.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(newTimer);
    } catch (error) {
      // Error handling is simulated in the hook, but kept here for structure
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4 shadow-lg">
      <h3 className="text-md font-semibold mb-3">
        Modifier le Délai de Non-réponse
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="no-reply-timer">Délai (secondes)</Label>
          <Input
            id="no-reply-timer"
            type="number"
            min="0"
            max="60"
            value={timer}
            onChange={(e) => setTimer(e.target.value)}
            disabled={disabled || isSubmitting}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Temps d'attente avant le renvoi (0 à 60 secondes).
          </p>
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={disabled || isSubmitting}
        >
          {isSubmitting ? "Mise à jour..." : "Mettre à jour le délai"}
        </Button>
      </form>
    </Card>
  );
};

export default NoReplyTimerForm;