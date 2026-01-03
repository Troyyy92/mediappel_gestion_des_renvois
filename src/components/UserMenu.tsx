import React from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/use-auth";

const UserMenu: React.FC = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    console.log("--- Début de la déconnexion ---");
    console.log("État de l'utilisateur avant signOut:", user?.email);
    
    try {
      await supabase.auth.signOut();
      console.log("SignOut réussi");
    } catch (error) {
      console.log("Erreur de déconnexion Supabase:", error);
    } finally {
      console.log("Redirection vers /login avec rechargement complet");
      
      // Force un rechargement complet de l'application (comme dans le navigateur)
      window.location.href = "/login";
      
      console.log("--- Fin de la déconnexion ---");
    }
  };

  if (!user) {
    return null;
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