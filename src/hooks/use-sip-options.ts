import React, { useState, useEffect, useCallback } from "react";
import { SipLineOptions, SipLine, ForwardingType } from "@/types/telephony";
import { showSuccess, showError } from "@/utils/toast";

// Données de simulation pour la gestion multi-lignes
const MOCK_LINES: SipLine[] = [
  { serviceName: "billingAccount1", lineNumber: "0033972103630", description: "Guy (OVH)" },
  { serviceName: "billingAccount1", lineNumber: "0033123456789", description: "Ligne Standard" },
  { serviceName: "billingAccount2", lineNumber: "0033999999999", description: "Support Technique" },
];

const initialOptions: SipLineOptions = {
  lineNumber: MOCK_LINES[0].lineNumber,
  serviceName: MOCK_LINES[0].serviceName,
  forwarding: {
    unconditional: { type: "unconditional", active: false, destination: "" },
    busy: { type: "busy", active: true, destination: "0611223344" },
    noReply: { type: "noReply", active: true, destination: "0655667788" },
  },
  noReplyTimer: 20,
};

const useSipOptions = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [options, setOptions] = useState<SipLineOptions>(initialOptions);
  const [availableLines, setAvailableLines] = useState<SipLine[]>(MOCK_LINES);
  const [selectedLine, setSelectedLine] = useState<SipLine>(MOCK_LINES[0]);

  // Simule la récupération des données (Feature F1)
  const fetchOptions = useCallback(async (line: SipLine) => {
    setIsLoading(true);
    // Simuler l'appel API OVH (délai de 1.5s)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simuler des données différentes pour chaque ligne
    const mockData: SipLineOptions = {
      lineNumber: line.lineNumber,
      serviceName: line.serviceName,
      forwarding: {
        unconditional: { type: "unconditional", active: line.lineNumber === MOCK_LINES[0].lineNumber ? false : true, destination: line.lineNumber === MOCK_LINES[0].lineNumber ? "" : "0600000000" },
        busy: { type: "busy", active: true, destination: "0611223344" },
        noReply: { type: "noReply", active: true, destination: "0655667788" },
      },
      noReplyTimer: line.lineNumber === MOCK_LINES[0].lineNumber ? 20 : 10,
    };

    setOptions(mockData);
    setIsLoading(false);
    showSuccess(`Paramètres chargés pour la ligne ${line.description}.`);
  }, []);

  useEffect(() => {
    fetchOptions(selectedLine);
  }, [selectedLine, fetchOptions]);

  // Simule la modification d'un renvoi (Feature F2)
  const updateForwarding = async (type: ForwardingType, destination: string | null) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const isActive = !!destination;
    
    setOptions(prev => ({
      ...prev,
      forwarding: {
        ...prev.forwarding,
        [type]: {
          ...prev.forwarding[type],
          active: isActive,
          destination: destination || undefined,
        },
      },
    }));
    
    setIsLoading(false);
    if (isActive) {
        showSuccess(`Renvoi ${type} mis à jour vers ${destination}.`);
    } else {
        showSuccess(`Renvoi ${type} désactivé.`);
    }
  };

  // Simule la modification du délai (Feature F3)
  const updateNoReplyTimer = async (timer: number) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    setOptions(prev => ({
      ...prev,
      noReplyTimer: timer,
    }));

    setIsLoading(false);
    showSuccess(`Délai de non-réponse mis à jour à ${timer} secondes.`);
  };

  // Simule la réinitialisation (Désactiver tout)
  const resetAllForwarding = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    setOptions(prev => ({
      ...prev,
      forwarding: {
        unconditional: { type: "unconditional", active: false, destination: "" },
        busy: { type: "busy", active: false, destination: "" },
        noReply: { type: "noReply", active: false, destination: "" },
      },
    }));

    setIsLoading(false);
    showSuccess("Tous les renvois ont été désactivés (Réinitialisation effectuée).");
  };

  const handleLineChange = (lineNumber: string) => {
    const line = availableLines.find(l => l.lineNumber === lineNumber);
    if (line) {
      setSelectedLine(line);
    } else {
      showError("Ligne non trouvée.");
    }
  };

  return {
    isLoading,
    options,
    availableLines,
    selectedLine,
    handleLineChange,
    fetchOptions: () => fetchOptions(selectedLine),
    updateForwarding,
    updateNoReplyTimer,
    resetAllForwarding,
  };
};

export default useSipOptions;