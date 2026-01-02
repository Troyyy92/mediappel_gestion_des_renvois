import React from "react";
import { SelectItem } from "@/components/ui/select";
import { SavedNumber } from "@/types/telephony";

interface SavedNumberSelectItemProps {
  num: SavedNumber;
}

const SavedNumberSelectItem: React.FC<SavedNumberSelectItemProps> = ({ num }) => {
  return (
    <SelectItem 
      value={num.number} 
      className="pl-4 pr-4 data-[state=checked]:bg-accent data-[state=checked]:text-foreground [&>span:last-child]:hidden"
    >
      <span className="truncate text-sm">
        {num.name} ({num.number})
      </span>
    </SelectItem>
  );
};

export default SavedNumberSelectItem;