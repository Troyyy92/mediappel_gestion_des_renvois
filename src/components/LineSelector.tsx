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
  // Trouver la ligne sélectionnée pour l'affichage si besoin, 
  // bien que SelectValue s'en occupe normalement via la valeur.
  const currentLine = availableLines.find(l => l.lineNumber === selectedLineNumber);

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
          <SelectValue placeholder="Choisir une ligne dans la liste...">
            {currentLine ? `${currentLine.description} (${currentLine.lineNumber})` : undefined}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {availableLines.map((line) => (
            <SelectItem 
              key={`${line.serviceName}-${line.lineNumber}`} 
              value={line.lineNumber}
              className="cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-medium">{line.description}</span>
                <span className="text-xs text-muted-foreground">{line.lineNumber}</span>
              </div>
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