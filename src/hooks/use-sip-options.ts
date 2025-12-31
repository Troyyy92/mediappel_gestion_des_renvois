import React, { useState, useEffect, useCallback } from "react";
import { SipLineOptions, SipLine, ForwardingType } from "@/types/telephony";
import { showSuccess, showError } from "@/utils/toast";

// Données de simulation pour la gestion multi-lignes
const MOCK_LINES: SipLine[] = [
  { serviceName: "billingAccount1", lineNumber: "0033972103630", description: "Guy (OVH)" },
  { serviceName: "billingAccount1", lineNumber: "0033123456789", description: "Ligne Standard" },
  { serviceName: "billingAccount2", lineNumber: "0033999999999", description: "Support Technique" },
  { serviceName: "billingAccount3", lineNumber: "0033972223538", description: "Nouvelle Ligne" },
];

const EMPTY_LINE: SipLine = {
  serviceName: "",
  lineNumber: "",
  description: "Sélectionner une ligne...",
};

const EMPTY_OPTIONS: SipLineOptions = {
  lineNumber: "",
  serviceName: "",
  forwarding: {
    unconditional: { type: "unconditional", active: false },
    busy: { type: "busy", active: false },
    noReply: { type: "noReply", active: false },
  },
  noReplyTimer: 0,
};

const useSipOptions = () => {
  const [isLoading, setIsLoading] = useState(false); // Start as false since we don't load anything initially
  const [options, setOptions] = useState<SipLineOptions>(EMPTY_OPTIONS);
  const [availableLines, setAvailableLines] = useState<SipLine[]>(MOCK_LINES);
  const [selectedLine, setSelectedLine] = useState<SipLine>(EMPTY_LINE);

  // Simule la récupération des données (Feature F1)
  const fetchOptions = useCallback(async (line: SipLine) => {
    if (!line.lineNumber) {
      setOptions(EMPTY_OPTIONS);
      return;
    }

    setIsLoading(true);
    // Simuler l'appel API OVH (délai de 1.5s)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simuler des données différentes pour chaque ligne
    let unconditionalActive = false;
    let noReplyTimer = 20;

    if (line.lineNumber === MOCK_LINES[0].lineNumber) {
      unconditionalActive = false;
      noReplyTimer = 20;
    } else if (line.lineNumber === MOCK_LINES[3].lineNumber) {
      unconditionalActive = true;
      noReplyTimer = 5;
    } else {
      unconditionalActive = true;
      noReplyTimer = 10;
    }

    const mockData: SipLineOptions = {
      lineNumber: line.lineNumber,
      serviceName: line.serviceName,
      forwarding: {
        unconditional: { type: "unconditional", active: unconditionalActive, destination: unconditionalActive ? "0600000000" : undefined },
        busy: { type: "busy", active: true, destination: "0611223344" },
        noReply: { type: "noReply", active: true, destination: "0655667788" },
      },
      noReplyTimer: noReplyTimer,
    };

    setOptions(mockData);
    setIsLoading(false);
    showSuccess(`Paramètres chargés pour la ligne ${line.description}.`);
  }, []);

  useEffect(() => {
    if (selectedLine.lineNumber) {
      fetchOptions(selectedLine);
    } else {
      setOptions(EMPTY_OPTIONS);
    }
  }, [selectedLine, fetchOptions]);

  // Simule la modification d'un renvoi (Feature F2)
  const updateForwarding = async (type: ForwardingType, destination: string | null) => {
    if (!selectedLine.lineNumber) return;
    
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
    if (!selectedLine.lineNumber) return;

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
    if (!selectedLine.lineNumber) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    setOptions(prev => ({
      ...prev,
      forwarding: {
        unconditional: { type: "unconditional", active: false, destination: undefined },
        busy: { type: "busy", active: false, destination: undefined },
        noReply: { type: "noReply", active: false, destination: undefined },
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
      // If the user selects the placeholder/empty value
      setSelectedLine(EMPTY_LINE);
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
    isLineSelected: !!selectedLine.lineNumber,
  };
};

export default useSipOptions;