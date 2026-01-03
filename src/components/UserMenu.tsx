import React from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/use-auth";
import { showError } from "@/utils/toast";
import { useNavigate } from "react-router-dom"; // Reintroduced

const UserMenu: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // Reintroduced

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Logout error:", error);
      
      // Si l'erreur est "Auth session missing!", cela signifie que l'utilisateur est déjà déconnecté
      // ou que le jeton est invalide côté client. Nous forçons la redirection.
      if (error.message.includes("Auth session missing!")) {
        navigate("/login");
        return;
      }
      
      showError("Erreur lors de la déconnexion. Veuillez réessayer.");
    } else {
      // Si la déconnexion réussit, nous naviguons explicitement pour garantir la redirection immédiate
      navigate("/login");
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