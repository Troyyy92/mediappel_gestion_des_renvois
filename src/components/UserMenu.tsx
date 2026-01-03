import React from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/use-auth";

const UserMenu: React.FC = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    console.log("--- Début de la déconnexion ---");
    
    try {
      // 1. Déconnexion Supabase
      await supabase.auth.signOut();
      console.log("SignOut Supabase réussi");
    } catch (error) {
      console.log("Erreur signOut (ignorée):", error);
    }
    
    // 2. Nettoyer TOUTES les données de session
    try {
      // Nettoyer le localStorage (sessions Supabase)
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Nettoyer le sessionStorage aussi
      sessionStorage.clear();
      
      console.log("Storage nettoyé");
    } catch (error) {
      console.log("Erreur nettoyage storage:", error);
    }
    
    // 3. Force un rechargement complet
    console.log("Rechargement vers /login");
    window.location.href = "/login";
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