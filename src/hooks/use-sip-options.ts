import React, { useState, useEffect, useCallback } from "react";
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

  // Récupérer les lignes SIP disponibles
  const fetchLines = useCallback(async () => {
    setIsLoading(true);
    try {
      const lines = await ovhClient.getSipLines();
      setAvailableLines(lines);
      
      // Si aucune ligne n'est sélectionnée et qu'il y a des lignes disponibles,
      // sélectionner la première par défaut
      if (!selectedLine.lineNumber && lines.length > 0) {
        setSelectedLine(lines[0]);
      }
      
      showSuccess("Lignes téléphoniques chargées");
    } catch (error) {
      console.error("Error fetching SIP lines:", error);
      showError("Erreur lors du chargement des lignes téléphoniques");
    } finally {
      setIsLoading(false);
    }
  }, [selectedLine.lineNumber]);

  // Récupérer les options pour une ligne spécifique
  const fetchOptions = useCallback(async (line: SipLine) => {
    if (!line.lineNumber) {
      setOptions(EMPTY_OPTIONS);
      return;
    }

    setIsLoading(true);
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
      showSuccess(`Paramètres chargés pour la ligne ${line.description}`);
    } catch (error) {
      console.error("Error fetching options:", error);
      showError("Erreur lors du chargement des paramètres de la ligne");
      setOptions(EMPTY_OPTIONS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger les lignes au démarrage
  useEffect(() => {
    fetchLines();
  }, [fetchLines]);

  // Charger les options quand une ligne est sélectionnée
  useEffect(() => {
    if (selectedLine.lineNumber) {
      fetchOptions(selectedLine);
    } else {
      setOptions(EMPTY_OPTIONS);
    }
  }, [selectedLine, fetchOptions]);

  // Mettre à jour un renvoi
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
    } catch (error) {
      console.error("Error updating forwarding:", error);
      // L'erreur est déjà gérée dans le client OVH
    } finally {
      setIsLoading(false);
    }
  };

  // Mettre à jour le délai de non-réponse
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
    } catch (error) {
      console.error("Error updating no reply timer:", error);
      // L'erreur est déjà gérée dans le client OVH
    } finally {
      setIsLoading(false);
    }
  };

  // Réinitialiser tous les renvois
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
          unconditional: {
            type: "unconditional",
            active: false,
            destination: undefined,
          },
          busy: {
            type: "busy",
            active: false,
            destination: undefined,
          },
          noReply: {
            type: "noReply",
            active: false,
            destination: undefined,
          },
        },
      }));
    } catch (error) {
      console.error("Error resetting all forwarding:", error);
      // L'erreur est déjà gérée dans le client OVH
    } finally {
      setIsLoading(false);
    }
  };

  const handleLineChange = (lineNumber: string) => {
    const line = availableLines.find(l => l.lineNumber === lineNumber);
    if (line) {
      setSelectedLine(line);
    } else {
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
    refreshLines: fetchLines, // Ajout d'une fonction pour rafraîchir les lignes
  };
};

export default useSipOptions;