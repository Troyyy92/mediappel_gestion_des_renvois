import React from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/use-auth";

const UserMenu: React.FC = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      
      // Force un rechargement complet de la page pour nettoyer tous les états
      window.location.href = "/login";
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
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