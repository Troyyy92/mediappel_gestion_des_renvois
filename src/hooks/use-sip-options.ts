import React, { useState, useEffect, useCallback, useRef } from "react";
import { SipLineOptions, SipLine, ForwardingType } from "@/types/telephony";
import { showSuccess, showError } from "@/utils/toast";
import { ovhClient } from "@/integrations/ovh/client";

const EMPTY_LINE: SipLine = {
  serviceName: "",
  lineNumber: "",
  description: "Sélectionner une ligne...",
};

const EMPTY_OPTIONS: SipLineOptions = {
  lineNumber: "",
  serviceName: "",
  forwarding: {
    unconditional: {
      type: "unconditional",
      active: false,
    },
    busy: {
      type: "busy",
      active: false,
    },
    noReply: {
      type: "noReply",
      active: false,
    },
  },
  noReplyTimer: 0,
};

const useSipOptions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<SipLineOptions>(EMPTY_OPTIONS);
  const [availableLines, setAvailableLines] = useState<SipLine[]>([]);
  const [selectedLine, setSelectedLine] = useState<SipLine>(EMPTY_LINE);
  const [error, setError] = useState<string | null>(null);
  
  // Utilisation d'une ref pour éviter les boucles infinies lors de l'auto-sélection
  const hasAutoSelected = useRef(false);

  // Récupérer les lignes SIP disponibles
  const fetchLines = useCallback(async (showToast = true) => {
    setIsLoading(true);
    setError(null);
    try {
      const lines = await ovhClient.getSipLines();
      setAvailableLines(lines);
      
      // Auto-sélection de la première ligne si rien n'est sélectionné
      if (!hasAutoSelected.current && lines.length > 0) {
        setSelectedLine(lines[0]);
        hasAutoSelected.current = true;
      }
      
      if (showToast) {
        showSuccess("Lignes téléphoniques chargées");
      }
    } catch (error: any) {
      console.error("Error fetching SIP lines:", error);
      const errorMessage = error.message || "Erreur lors du chargement des lignes téléphoniques";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []); // Retrait de selectedLine.lineNumber des dépendances

  // Récupérer les options pour une ligne spécifique
  const fetchOptions = useCallback(async (line: SipLine) => {
    if (!line || !line.lineNumber) {
      setOptions(EMPTY_OPTIONS);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const ovhOptions = await ovhClient.getSipLineOptions(
        line.serviceName,
        line.lineNumber
      );

      const formattedOptions: SipLineOptions = {
        lineNumber: line.lineNumber,
        serviceName: line.serviceName,
        forwarding: {
          unconditional: {
            type: "unconditional",
            active: ovhOptions.forwarding.unconditional.active,
            destination: ovhOptions.forwarding.unconditional.destination,
          },
          busy: {
            type: "busy",
            active: ovhOptions.forwarding.busy.active,
            destination: ovhOptions.forwarding.busy.destination,
          },
          noReply: {
            type: "noReply",
            active: ovhOptions.forwarding.noReply.active,
            destination: ovhOptions.forwarding.noReply.destination,
          },
        },
        noReplyTimer: ovhOptions.noReplyTimer,
      };

      setOptions(formattedOptions);
    } catch (error: any) {
      console.error("Error fetching options:", error);
      const errorMessage = error.message || "Erreur lors du chargement des paramètres de la ligne";
      setError(errorMessage);
      showError(errorMessage);
      setOptions(EMPTY_OPTIONS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger les lignes au démarrage uniquement
  useEffect(() => {
    fetchLines();
  }, [fetchLines]);

  // Charger les options quand une ligne est sélectionnée
  useEffect(() => {
    if (selectedLine && selectedLine.lineNumber) {
      fetchOptions(selectedLine);
    } else {
      setOptions(EMPTY_OPTIONS);
    }
  }, [selectedLine, fetchOptions]);

  const updateForwarding = async (type: ForwardingType, destination: string | null) => {
    if (!selectedLine.lineNumber) return;

    setIsLoading(true);
    try {
      await ovhClient.updateForwarding(
        selectedLine.serviceName,
        selectedLine.lineNumber,
        type,
        destination
      );

      setOptions(prev => ({
        ...prev,
        forwarding: {
          ...prev.forwarding,
          [type]: {
            ...prev.forwarding[type],
            active: !!destination,
            destination: destination || undefined,
          },
        },
      }));
    } catch (error: any) {
      console.error("Error updating forwarding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateNoReplyTimer = async (timer: number) => {
    if (!selectedLine.lineNumber) return;

    setIsLoading(true);
    try {
      await ovhClient.updateNoReplyTimer(
        selectedLine.serviceName,
        selectedLine.lineNumber,
        timer
      );

      setOptions(prev => ({
        ...prev,
        noReplyTimer: timer,
      }));
    } catch (error: any) {
      console.error("Error updating no reply timer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAllForwarding = async () => {
    if (!selectedLine.lineNumber) return;

    setIsLoading(true);
    try {
      await ovhClient.resetAllForwarding(
        selectedLine.serviceName,
        selectedLine.lineNumber
      );

      setOptions(prev => ({
        ...prev,
        forwarding: {
          unconditional: { type: "unconditional", active: false },
          busy: { type: "busy", active: false },
          noReply: { type: "noReply", active: false },
        },
      }));
    } catch (error: any) {
      console.error("Error resetting all forwarding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLineChange = (lineNumber: string) => {
    if (!lineNumber) {
      setSelectedLine(EMPTY_LINE);
      return;
    }
    const line = availableLines.find(l => l.lineNumber === lineNumber);
    if (line) {
      setSelectedLine(line);
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
    refreshLines: fetchLines,
    error,
  };
};

export default useSipOptions;