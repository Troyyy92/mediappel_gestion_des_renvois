"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SipLineOptions } from "@/types/telephony";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface LineInfoCardProps {
  options: SipLineOptions;
}

const ForwardingStatus: React.FC<{ active: boolean; destination?: string; type: string; lineNumber: string }> = ({
  active,
  destination,
  type,
  lineNumber
}) => {
  // On affiche "Répondeur" si le numéro de destination correspond au numéro de la ligne (cas typique OVH pour le répondeur)
  // ou si c'est un renvoi forcé sur répondeur.
  const isVoicemail = destination === lineNumber || destination === "voicemail" || (active && (type === "busy" || type === "noReply"));
  
  return (
    <div className="flex items-center space-x-2">
      {active ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400" />
      )}
      <span className="font-mono text-sm">
        {active ? (isVoicemail ? "Répondeur" : destination) : "Non configuré"}
      </span>
    </div>
  );
};

const LineInfoCard: React.FC<LineInfoCardProps> = ({ options }) => {
  const { forwarding, noReplyTimer, lineNumber } = options;

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="text-lg">
          Statut Actuel de la Ligne {lineNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <p className="font-medium text-gray-600">Renvoi Inconditionnel:</p>
          <ForwardingStatus
            active={forwarding.unconditional.active}
            destination={forwarding.unconditional.destination}
            type="unconditional"
            lineNumber={lineNumber}
          />

          <p className="font-medium text-gray-600">Renvoi sur Occupation:</p>
          <ForwardingStatus
            active={forwarding.busy.active}
            destination={forwarding.busy.destination}
            type="busy"
            lineNumber={lineNumber}
          />

          <p className="font-medium text-gray-600">Renvoi sur Non-réponse:</p>
          <ForwardingStatus
            active={forwarding.noReply.active}
            destination={forwarding.noReply.destination}
            type="noReply"
            lineNumber={lineNumber}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Délai Non-réponse:</span>
          </div>
          <span className="font-bold text-primary">
            {noReplyTimer} secondes
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default LineInfoCard;