import React, { useState } from "react";
import { SavedNumber } from "@/types/telephony";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Phone, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { showError } from "@/utils/toast";

interface SavedNumbersManagerProps {
  savedNumbers: SavedNumber[];
  addNumber: (name: string, number: string) => boolean;
  removeNumber: (id: string) => void;
}

const SavedNumbersManager: React.FC<SavedNumbersManagerProps> = ({
  savedNumbers,
  addNumber,
  removeNumber,
}) => {
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addNumber(newName, newNumber)) {
      setNewName("");
      setNewNumber("");
      setIsAdding(false);
    }
  };

  const isValidNumber = (num: string) => {
    const cleaned = num.trim().replace(/[^0-9+]/g, "");
    return cleaned.length >= 3;
  };

  const isFormValid = newName.trim().length > 0 && isValidNumber(newNumber);

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-between">
          Numéros de Renvoi Rapides
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isAdding ? "Annuler" : "Ajouter"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <form onSubmit={handleAddSubmit} className="space-y-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
            <h4 className="font-semibold">Nouveau numéro</h4>
            <div className="space-y-1">
              <Label htmlFor="new-name">Nom (Ex: Standard)</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="new-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nom du contact"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-number">Numéro de téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="new-number"
                  type="tel"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  placeholder="Ex: 00336..."
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={!isFormValid}>
              Enregistrer le numéro
            </Button>
            <Separator />
          </form>
        )}

        {savedNumbers.length === 0 && !isAdding ? (
          <p className="text-center text-muted-foreground">
            Aucun numéro enregistré. Cliquez sur Ajouter pour en créer un.
          </p>
        ) : (
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {savedNumbers.map((num) => (
              <li
                key={num.id}
                className="flex items-center justify-between p-2 border rounded-md bg-white dark:bg-card"
              >
                <div>
                  <p className="font-medium text-sm">{num.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {num.number}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeNumber(num.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedNumbersManager;