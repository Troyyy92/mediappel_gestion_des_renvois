import { MadeWithDyad } from "@/components/made-with-dyad";
import Layout from "@/components/Layout";
import AppHeader from "@/components/AppHeader";
import LineSelector from "@/components/LineSelector";
import LineInfoCard from "@/components/LineInfoCard";
import ForwardingForm from "@/components/ForwardingForm";
import ForwardingHistoryModal from "@/components/ForwardingHistoryModal";
import UserMenu from "@/components/UserMenu"; // Import du nouveau composant
import useSipOptions from "@/hooks/use-sip-options";
import useSavedNumbers from "@/hooks/use-saved-numbers";
import { Button } from "@/components/ui/button";
import { RefreshCw, MousePointerClick, AlertCircle, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

const Index = () => {
  const {
    isLoading,
    options,
    availableLines,
    selectedLineNumber,
    handleLineChange,
    fetchOptions,
    updateForwarding,
    undoUnconditional,
    canUndoUnconditional,
    isLineSelected,
    refreshLines,
    error,
  } = useSipOptions();
  
  const { savedNumbers, addNumber, removeNumber } = useSavedNumbers();
  const [showHelp, setShowHelp] = useState(false);

  // Fonction pour déterminer si l'erreur est liée à l'authentification OVH
  const isOvhAuthError = error && error.includes("You must login first");

  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto relative">
        {/* Positionnement du menu utilisateur en haut à droite */}
        <div className="absolute top-0 right-0 z-10">
          <UserMenu />
        </div>
        
        <AppHeader />
        
        <LineSelector
          availableLines={availableLines}
          selectedLineNumber={selectedLineNumber}
          onLineChange={handleLineChange}
          disabled={isLoading}
        />
        
        <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-4xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Configuration de la Ligne
            </h2>
            <div className="flex flex-wrap gap-2">
              <ForwardingHistoryModal />
              <Button
                onClick={fetchOptions}
                disabled={isLoading || !isLineSelected}
                className="bg-[#11998e] hover:bg-[#38ef7d] text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">Erreur de connexion</p>
                <p className="text-red-600 text-sm">{error}</p>
                
                {isOvhAuthError && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-800 text-sm">
                      <strong>Problème d'authentification OVH :</strong> Vos clés OVH ne sont pas correctement configurées ou n'ont pas les permissions nécessaires.
                    </p>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-blue-600 hover:text-blue-800 mt-1"
                      onClick={() => setShowHelp(true)}
                    >
                      <HelpCircle className="w-4 h-4 mr-1 inline" />
                      Voir les instructions de configuration
                    </Button>
                  </div>
                )}
                
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-red-600 hover:text-red-800 mt-2"
                  onClick={() => refreshLines(false)}
                >
                  Réessayer
                </Button>
              </div>
            </div>
          )}
          
          {showHelp && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">Configuration des clés OVH</h3>
              <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                <li>Connectez-vous à votre compte OVH : <a href="https://www.ovh.com/auth/" target="_blank" rel="noopener noreferrer" className="underline">https://www.ovh.com/auth/</a></li>
                <li>Allez dans "API & Services" > "API Access"</li>
                <li>Créez une nouvelle application avec les permissions nécessaires</li>
                <li>Générez une clé de consommateur avec les permissions pour :
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>GET /telephony</li>
                    <li>GET /telephony/{'{billingAccount}'}/line</li>
                    <li>GET /telephony/{'{billingAccount}'}/line/{'{lineNumber}'}</li>
                    <li>GET/PUT /telephony/{'{billingAccount}'}/line/{'{lineNumber}'}/forwarding/*</li>
                    <li>GET/PUT /telephony/{'{billingAccount}'}/line/{'{lineNumber}'}/noReplyTimer</li>
                  </ul>
                </li>
                <li>Mettez à jour les variables d'environnement avec les nouvelles clés</li>
              </ol>
              <Button 
                variant="ghost" 
                size="sm"
                className="mt-2"
                onClick={() => setShowHelp(false)}
              >
                Fermer
              </Button>
            </div>
          )}
          
          {isLoading && isLineSelected ? (
            <div className="flex flex-col items-center justify-center h-48">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <p className="mt-4 text-gray-600">
                Chargement des paramètres...
              </p>
            </div>
          ) : !isLineSelected ? (
            <Card className="p-8 text-center border-2 border-dashed border-gray-300 bg-gray-50 h-48 flex flex-col items-center justify-center">
              <MousePointerClick className="w-8 h-8 text-gray-500 mb-3" />
              <p className="text-lg font-medium text-gray-700">
                Veuillez sélectionner une ligne ci-dessus pour commencer la configuration.
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              <LineInfoCard options={options} />
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ForwardingForm
                  type="unconditional"
                  label="Renvoi Inconditionnel"
                  currentOption={options.forwarding.unconditional}
                  onUpdate={updateForwarding}
                  disabled={isLoading || !isLineSelected}
                  savedNumbers={savedNumbers}
                  addSavedNumber={addNumber}
                  removeSavedNumber={removeNumber}
                  onUndo={undoUnconditional}
                  canUndo={canUndoUnconditional}
                />
                <ForwardingForm
                  type="busy"
                  label="Renvoi sur Occupation"
                  currentOption={options.forwarding.busy}
                  onUpdate={updateForwarding}
                  disabled={isLoading || !isLineSelected}
                  savedNumbers={savedNumbers}
                  addSavedNumber={addNumber}
                  removeSavedNumber={removeNumber}
                />
                <ForwardingForm
                  type="noReply"
                  label="Renvoi sur Non-réponse"
                  currentOption={options.forwarding.noReply}
                  onUpdate={updateForwarding}
                  disabled={isLoading || !isLineSelected}
                  savedNumbers={savedNumbers}
                  addSavedNumber={addNumber}
                  removeSavedNumber={removeNumber}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <MadeWithDyad />
    </Layout>
  );
};

export default Index;