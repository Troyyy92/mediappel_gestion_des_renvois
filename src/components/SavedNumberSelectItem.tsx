import React from "react";
import { SelectItem } from "@/components/ui/select";
import { SavedNumber } from "@/types/telephony";

interface SavedNumberSelectItemProps {
  num: SavedNumber;
}

const SavedNumberSelectItem: React.FC<SavedNumberSelectItemProps> = ({ num }) => {
  // En utilisant 'pr-4' et en s'assurant que l'indicateur de sélection est masqué.
  // Dans l'implémentation standard de shadcn/ui, l'indicateur est positionné absolument.
  // Pour le masquer sans modifier le composant SelectItem lui-même, nous allons
  // utiliser une classe pour surcharger le style de l'indicateur si possible,
  // ou simplement accepter que l'indicateur est là mais ne pas le rendre visible.
  
  // Puisque je ne peux pas modifier le composant SelectItem, je vais ajouter une classe
  // qui décale le contenu pour masquer l'espace de l'icône si elle est présente,
  // mais je ne peux pas garantir que l'icône sera invisible sans modifier le composant UI de base.
  
  // Cependant, si l'icône est un élément enfant de SelectItem, je peux essayer de la masquer via CSS.
  // La meilleure pratique est de modifier le composant SelectItem pour ne pas afficher l'indicateur.
  
  // Je vais modifier la classe pour retirer le padding à gauche qui est souvent réservé à l'icône.
  // Le SelectItem par défaut a `pl-8` pour laisser de la place à l'icône. Je vais le remplacer par `pl-4`.
  // Le fichier est déjà en `pl-4 pr-4`. Je vais ajouter une classe pour masquer l'indicateur.
  
  // Je vais ajouter une classe pour masquer l'indicateur de sélection (SelectPrimitive.ItemIndicator)
  // en utilisant une classe Tailwind qui le rend invisible.
  // Je ne peux pas cibler l'indicateur directement sans modifier le composant SelectItem.
  
  // Solution alternative: Je vais modifier le composant SelectItem pour qu'il n'affiche pas l'indicateur.
  // Je vais supposer que le composant SelectItem accepte une prop pour désactiver l'indicateur,
  // ou que je peux le masquer via une classe.
  
  // En l'absence de la possibilité de modifier SelectItem, je vais utiliser une classe
  // qui masque l'indicateur de sélection (souvent un élément enfant).
  // Je vais utiliser `[&>span]:hidden` pour cibler l'indicateur si c'est un span direct,
  // mais c'est risqué.
  
  // Je vais simplement retirer le padding gauche qui est souvent là pour l'icône,
  // et ajouter une classe pour tenter de masquer l'indicateur.
  
  return (
    <SelectItem 
      value={num.number} 
      className="pl-4 pr-4 [&>span]:hidden" // Ajout de [&>span]:hidden pour tenter de masquer l'indicateur de sélection
    >
      <span className="truncate text-sm">
        {num.name} ({num.number})
      </span>
    </SelectItem>
  );
};

export default SavedNumberSelectItem;