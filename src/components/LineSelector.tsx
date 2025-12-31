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
        value={selectedLineNumber}
        onValueChange={onLineChange}
        disabled={disabled}
      >
        <SelectTrigger id="line-selector" className="w-full bg-white/90">
          <SelectValue placeholder="Sélectionner une ligne..." />
        </SelectTrigger>
        <SelectContent>
          {availableLines.map((line) => (
            <SelectItem key={line.lineNumber} value={line.lineNumber}>
              {line.description} ({line.lineNumber})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LineSelector;