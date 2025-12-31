import { useState, useEffect, useCallback } from "react";
import { SavedNumber } from "@/types/telephony";
import { showSuccess, showError } from "@/utils/toast";

const MOCK_SAVED_NUMBERS: SavedNumber[] = [
  { id: "1", name: "Messagerie Vocale", number: "123" },
  { id: "2", name: "Standard Accueil", number: "0033140000000" },
  { id: "3", name: "Mobile Urgence", number: "0699887766" },
];

const STORAGE_KEY = "dyad_saved_numbers";

const useSavedNumbers = () => {
  const [savedNumbers, setSavedNumbers] = useState<SavedNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simuler le chargement depuis le stockage local
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedNumbers(JSON.parse(stored));
      } else {
        // Initialiser avec les mocks si rien n'est trouvé
        setSavedNumbers(MOCK_SAVED_NUMBERS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_SAVED_NUMBERS));
      }
    } catch (e) {
      console.error("Failed to load saved numbers from storage", e);
      setSavedNumbers(MOCK_SAVED_NUMBERS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Simuler la sauvegarde dans le stockage local
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedNumbers));
      } catch (e) {
        console.error("Failed to save numbers to storage", e);
      }
    }
  }, [savedNumbers, isLoading]);

  const addNumber = useCallback((name: string, number: string) => {
    const newNumber: SavedNumber = {
      id: Date.now().toString(),
      name: name.trim(),
      number: number.trim().replace(/[^0-9+]/g, ""),
    };

    if (!newNumber.name || !newNumber.number) {
      showError("Le nom et le numéro sont requis.");
      return false;
    }
    if (newNumber.number.length < 3) {
      showError("Le numéro est trop court.");
      return false;
    }

    setSavedNumbers((prev) => [...prev, newNumber]);
    showSuccess(`Numéro "${newNumber.name}" enregistré.`);
    return true;
  }, []);

  const removeNumber = useCallback((id: string) => {
    setSavedNumbers((prev) => prev.filter((n) => n.id !== id));
    showSuccess("Numéro enregistré supprimé.");
  }, []);

  return {
    savedNumbers,
    addNumber,
    removeNumber,
    isLoading,
  };
};

export default useSavedNumbers;