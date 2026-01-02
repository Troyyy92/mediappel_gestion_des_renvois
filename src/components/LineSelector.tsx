import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SipLine } from "@/types/telephony";
import { Label } from "@/components/ui/label";

interface LineSelectorProps {
  availableLines: SipLine[];
  selectedLineNumber: string;
  onLineChange: (lineNumber: string) => void;
  disabled: boolean;
}

const LineSelector: React.FC<LineSelectorProps> = ({
  availableLines,
  selectedLineNumber,
  onLineChange,
  disabled,
}) => {
  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <Label htmlFor="line-selector" className="text-white mb-2 block text-left">
        Ligne à configurer
      </Label>
      <Select
        value={selectedLineNumber || undefined}
        onValueChange={onLineChange}
        disabled={disabled || availableLines.length === 0}
      >
        <SelectTrigger 
          id="line-selector" 
          className="w-full bg-white text-gray-900 border-none shadow-md focus:ring-2 focus:ring-primary/50"
        >
          <SelectValue placeholder="Choisir une ligne dans la liste..." />
        </SelectTrigger>
        <SelectContent>
          {availableLines.map((line) => (
            <SelectItem 
              key={`${line.serviceName}-${line.lineNumber}`} 
              value={line.lineNumber}
            >
              {line.description} ({line.lineNumber})
            </SelectItem>
          ))}
          {availableLines.length === 0 && !disabled && (
            <div className="p-2 text-sm text-center text-muted-foreground">
              Aucune ligne trouvée
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LineSelector;