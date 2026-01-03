import React from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";

const UserMenu: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log("--- Début de la déconnexion ---");
    console.log("État de l'utilisateur avant signOut:", user ? user.email : "Non connecté");
    
    try {
      // Tente de déconnecter l'utilisateur
      await supabase.auth.signOut();
      console.log("Déconnexion Supabase réussie (ou session déjà manquante).");
    } catch (error) {
      // Loguer l'erreur mais l'ignorer si elle est liée à une session manquante
      console.error("Erreur de déconnexion Supabase (ignorée si session manquante):", error);
    } finally {
      // Toujours rediriger vers login, même en cas d'erreur ou de succès
      console.log("Redirection vers /login.");
      navigate("/login");
      console.log("--- Fin de la déconnexion ---");
    }
  };

  if (!user) {
    return null; // Ne rien afficher si l'utilisateur n'est pas chargé ou connecté
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleLogout} 
      className="relative h-10 w-10 rounded-full text-white hover:bg-white/20 transition-colors"
      title="Déconnexion"
    >
      <LogOut className="h-5 w-5" />
    </Button>
  );
};

export default UserMenu;