import React from "react";
import { SelectItem } from "@/components/ui/select";
import { SavedNumber } from "@/types/telephony";

interface SavedNumberSelectItemProps {
  num: SavedNumber;
}

const SavedNumberSelectItem: React.FC<SavedNumberSelectItemProps> = ({ num }) => {
  // L'indicateur de sélection (coche) est généralement un enfant de SelectItem.
  // Pour le masquer, nous allons utiliser une classe qui cible l'indicateur de sélection
  // (souvent un élément SelectPrimitive.ItemIndicator) et le masque.
  // Dans l'implémentation shadcn/ui, l'indicateur est souvent le premier enfant span.
  // Cependant, pour éviter de masquer le contenu, nous allons utiliser une classe
  // qui masque l'indicateur de sélection sans affecter le contenu textuel.
  
  // Je vais utiliser la classe `[&>span:first-child]:hidden` pour cibler l'indicateur
  // de sélection qui est souvent le premier enfant span, tout en gardant le texte visible.
  // Je retire également le `pl-8` par défaut pour éviter l'espace vide laissé par l'icône.
  
  return (
    <SelectItem 
      value={num.number} 
      // La classe `pl-4` réduit le padding gauche. La classe `[&>span:first-child]:hidden`
      // tente de masquer l'indicateur de sélection (la coche).
      className="pl-4 pr-4 [&>span:first-child]:hidden"
    >
      <span className="truncate text-sm">
        {num.name} ({num.number})
      </span>
    </SelectItem>
  );
};

export default SavedNumberSelectItem;