import React from "react";
import { PhoneCall } from "lucide-react";

const AppHeader: React.FC = () => {
  return (
    <header className="text-center mb-8 text-white">
      <div className="flex items-center justify-center space-x-3">
        <PhoneCall className="w-8 h-8 md:w-10 md:h-10" />
        <h1 className="text-3xl md:text-4xl font-bold">
          Gestion des Renvois d'Appels SIP
        </h1>
      </div>
      <p className="mt-2 text-lg opacity-90">
        Interface simplifiée pour piloter vos lignes OVH.
      </p>
    </header>
  );
};

export default AppHeader;