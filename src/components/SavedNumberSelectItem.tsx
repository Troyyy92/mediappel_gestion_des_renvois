import React from "react";
import { SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { SavedNumber } from "@/types/telephony";

interface SavedNumberSelectItemProps {
  num: SavedNumber;
  onRemove: (id: string) => void;
}

const SavedNumberSelectItem: React.FC<SavedNumberSelectItemProps> = ({ num, onRemove }) => {
  const handleRemove = (e: React.MouseEvent) => {
    // Stop propagation to prevent the SelectItem from being selected when clicking the delete button
    e.stopPropagation();
    onRemove(num.id);
  };

  return (
    <SelectItem value={num.number} className="p-0">
      <div className="flex items-center justify-between w-full px-2 py-1.5">
        <span className="flex-grow truncate">
          {num.name} ({num.number})
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          className="h-6 w-6 text-destructive hover:bg-destructive/10 ml-2"
          title={`Supprimer ${num.name}`}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </SelectItem>
  );
};

export default SavedNumberSelectItem;