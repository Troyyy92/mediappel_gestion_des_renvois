import { useState, useEffect, useCallback } from "react";
import { SavedNumber } from "@/types/telephony";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "./use-auth";

// Type pour les données Supabase (user_id n'est plus utilisé dans le code, mais peut rester dans la DB)
interface SavedNumberDB {
  id: string;
  name: string;
  number: string;
  user_id?: string; // Rendu optionnel
}

const useSavedNumbers = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [savedNumbers, setSavedNumbers] = useState<SavedNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSavedNumbers = useCallback(async () => {
    // Nous n'avons plus besoin de vérifier 'user' ici si nous voulons que ce soit global
    setIsLoading(true);
    
    // Suppression du filtre par user_id
    const { data, error } = await supabase
      .from('saved_numbers')
      .select('id, name, number')
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching saved numbers:", error);
      showError("Erreur lors du chargement des numéros enregistrés.");
      setSavedNumbers([]);
    } else {
      const numbers: SavedNumber[] = data.map(item => ({
        id: item.id,
        name: item.name,
        number: item.number,
      }));
      setSavedNumbers(numbers);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Nous attendons toujours que l'authentification soit chargée pour commencer
    if (!isAuthLoading) {
      fetchSavedNumbers();
    }
  }, [isAuthLoading, fetchSavedNumbers]);

  const addNumber = useCallback(async (name: string, number: string) => {
    // Nous n'avons plus besoin de vérifier 'user' pour l'accès, mais nous vérifions l'état de connexion
    if (!user) {
      showError("Vous devez être connecté pour enregistrer des numéros.");
      return false;
    }
    
    const cleanedNumber = number.trim().replace(/[^0-9+]/g, "");
    const trimmedName = name.trim();

    if (!trimmedName || !cleanedNumber) {
      showError("Le nom et le numéro sont requis.");
      return false;
    }

    if (cleanedNumber.length < 3) {
      showError("Le numéro est trop court.");
      return false;
    }

    if (savedNumbers.some(n => n.number === cleanedNumber)) {
      showError("Ce numéro est déjà enregistré.");
      return false;
    }

    const newNumberData = {
      name: trimmedName,
      number: cleanedNumber,
      // Suppression de user_id: user.id
    };

    const { data, error } = await supabase
      .from('saved_numbers')
      .insert(newNumberData)
      .select('id, name, number')
      .single();

    if (error) {
      console.error("Error adding saved number:", error);
      showError("Erreur lors de l'enregistrement du numéro.");
      return false;
    }

    const newSavedNumber: SavedNumber = {
      id: data.id,
      name: data.name,
      number: data.number,
    };

    setSavedNumbers((prev) => [...prev, newSavedNumber]);
    showSuccess(`Numéro "${newSavedNumber.name}" enregistré.`);
    return true;
  }, [user, savedNumbers]);

  const removeNumber = useCallback(async (id: string) => {
    if (!user) {
      showError("Vous devez être connecté pour supprimer des numéros.");
      return;
    }

    const { error } = await supabase
      .from('saved_numbers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error removing saved number:", error);
      showError("Erreur lors de la suppression du numéro.");
      return;
    }

    setSavedNumbers((prev) => prev.filter((n) => n.id !== id));
    showSuccess("Numéro enregistré supprimé.");
  }, [user]);

  return {
    savedNumbers,
    addNumber,
    removeNumber,
    isLoading: isLoading || isAuthLoading,
  };
};

export default useSavedNumbers;