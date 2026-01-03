import React from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
// Removed unused import: import { showError } from "@/utils/toast";

const UserMenu: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log("--- Début de la déconnexion ---");
    console.log("État de l'utilisateur avant signOut:", user ? user.email : "Non connecté");
    
    try {
      // Tente de déconnecter l'utilisateur
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error; // Lance l'erreur pour être capturée par le bloc catch
      }
      
      console.log("Déconnexion Supabase réussie.");
    } catch (error) {
      // Loguer l'erreur complète
      console.error("Erreur de déconnexion Supabase:", error);
      
      // Vérification spécifique pour l'erreur de session manquante
      if (error instanceof Error && error.message.includes("Auth session missing!")) {
        console.log("Erreur de session manquante détectée. Forçage de la redirection.");
      } else {
        console.log("Erreur non critique ignorée pour forcer la redirection.");
      }
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