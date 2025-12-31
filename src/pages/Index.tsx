import { MadeWithDyad } from "@/components/made-with-dyad";
import Layout from "@/components/Layout";
import AppHeader from "@/components/AppHeader";
import LineSelector from "@/components/LineSelector";
import LineInfoCard from "@/components/LineInfoCard";
import ForwardingForm from "@/components/ForwardingForm";
import NoReplyTimerForm from "@/components/NoReplyTimerForm";
import useSipOptions from "@/hooks/use-sip-options";
import useSavedNumbers from "@/hooks/use-saved-numbers";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, MousePointerClick } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const {
    isLoading,
    options,
    availableLines,
    selectedLine,
    handleLineChange,
    fetchOptions,
    updateForwarding,
    updateNoReplyTimer,
    resetAllForwarding,
    isLineSelected,
  } = useSipOptions();

  const { savedNumbers, addNumber, removeNumber } = useSavedNumbers();

  const handleReset = () => {
    if (window.confirm("ATTENTION : Voulez-vous vraiment désactiver TOUS les renvois pour cette ligne ?")) {
      resetAllForwarding();
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto">
        <AppHeader />

        <LineSelector
          availableLines={availableLines}
          selectedLineNumber={selectedLine.lineNumber}
          onLineChange={handleLineChange}
          disabled={isLoading}
        />

        <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Configuration de la Ligne
            </h2>
            <div className="flex space-x-2">
              <Button
                onClick={fetchOptions}
                disabled={isLoading || !isLineSelected}
                className="bg-[#11998e] hover:bg-[#38ef7d] text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
              <Button
                onClick={handleReset}
                disabled={isLoading || !isLineSelected}
                variant="destructive"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Réinitialiser Tout
              </Button>
            </div>
          </div>

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

              <div className="flex justify-center pt-4">
                <Card className="w-full max-w-xs shadow-lg">
                  <NoReplyTimerForm
                    currentTimer={options.noReplyTimer}
                    onUpdate={updateNoReplyTimer}
                    disabled={isLoading || !isLineSelected}
                  />
                </Card>
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