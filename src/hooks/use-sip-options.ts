import React, { useState, useEffect, useCallback } from "react";
import { SipLineOptions, SipLine, ForwardingType } from "@/types/telephony";
import { showSuccess, showError } from "@/utils/toast";
import { ovhClient } from "@/integrations/ovh/client";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "./use-auth";

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
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<SipLineOptions>(EMPTY_OPTIONS);
  const [availableLines, setAvailableLines] = useState<SipLine[]>([]);
  const [selectedLine, setSelectedLine] = useState<SipLine | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fetchLines = useCallback(async (showToast = true) => {
    setIsLoading(true);
    setError(null);
    try {
      const lines = await ovhClient.getSipLines();
      setAvailableLines(lines);
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
  }, []);

  const fetchOptions = useCallback(async (line: SipLine) => {
    if (!line || !line.lineNumber) return;

    setIsLoading(true);
    try {
      const ovhOptions = await ovhClient.getSipLineOptions(
        line.serviceName,
        line.lineNumber
      );

      setOptions({
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
      });
    } catch (error: any) {
      console.error("Error fetching options:", error);
      showError("Erreur lors du chargement des paramètres de la ligne");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLines();
  }, [fetchLines]);

  useEffect(() => {
    if (selectedLine) {
      fetchOptions(selectedLine);
    } else {
      setOptions(EMPTY_OPTIONS);
    }
  }, [selectedLine, fetchOptions]);

  const logToHistory = async (type: ForwardingType, destination: string | null) => {
    if (!selectedLine || !user) return;
    
    const { error } = await supabase.from('forwarding_history').insert({
      user_id: user.id,
      line_number: selectedLine.lineNumber,
      destination_number: destination,
      forwarding_type: type,
      action_type: destination ? 'activation' : 'deactivation'
    });

    if (error) {
      console.error("Erreur lors de l'enregistrement dans l'historique:", error);
    }
  };

  const updateForwarding = async (type: ForwardingType, destination: string | null) => {
    if (!selectedLine || !user) return;
    setIsLoading(true);
    try {
      await ovhClient.updateForwarding(selectedLine.serviceName, selectedLine.lineNumber, type, destination);
      
      // Enregistrement dans l'historique
      await logToHistory(type, destination);

      setOptions(prev => ({
        ...prev,
        forwarding: {
          ...prev.forwarding,
          [type]: { ...prev.forwarding[type], active: !!destination, destination: destination || undefined },
        },
      }));
    } catch (err) {
      console.error("Error updating forwarding:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateNoReplyTimer = async (timer: number) => {
    if (!selectedLine) return;
    setIsLoading(true);
    try {
      await ovhClient.updateNoReplyTimer(selectedLine.serviceName, selectedLine.lineNumber, timer);
      setOptions(prev => ({ ...prev, noReplyTimer: timer }));
    } finally {
      setIsLoading(false);
    }
  };

  const resetAllForwarding = async () => {
    if (!selectedLine) return;
    setIsLoading(true);
    try {
      await ovhClient.resetAllForwarding(selectedLine.serviceName, selectedLine.lineNumber);
      
      // On logue la désactivation de tous les types
      await logToHistory("unconditional", null);
      await logToHistory("busy", null);
      await logToHistory("noReply", null);

      setOptions(prev => ({
        ...prev,
        forwarding: {
          unconditional: { type: "unconditional", active: false },
          busy: { type: "busy", active: false },
          noReply: { type: "noReply", active: false },
        },
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLineChange = (lineNumber: string) => {
    const line = availableLines.find(l => l.lineNumber === lineNumber);
    setSelectedLine(line || null);
  };

  return {
    isLoading,
    options,
    availableLines,
    selectedLineNumber: selectedLine?.lineNumber || "",
    handleLineChange,
    fetchOptions: () => selectedLine && fetchOptions(selectedLine),
    updateForwarding,
    updateNoReplyTimer,
    resetAllForwarding,
    isLineSelected: !!selectedLine,
    refreshLines: fetchLines,
    error,
  };
};

export default useSipOptions;