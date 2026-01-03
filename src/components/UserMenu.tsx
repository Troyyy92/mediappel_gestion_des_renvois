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
    try {
      // Tente de déconnecter l'utilisateur
      await supabase.auth.signOut();
    } catch (error) {
      // Ignorer l'erreur si pas de session active (Auth session missing!)
      console.log("Logout error (ignored):", error);
    } finally {
      // Toujours rediriger vers login, même en cas d'erreur ou de succès
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