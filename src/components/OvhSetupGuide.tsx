import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Check } from "lucide-react";
import { showSuccess } from "@/utils/toast";

interface OvhSetupGuideProps {
  onClose: () => void;
}

const OvhSetupGuide: React.FC<OvhSetupGuideProps> = ({ onClose }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const steps = [
    {
      title: "Se connecter à l'espace client OVH",
      description: "Accédez à votre compte OVH pour commencer la configuration.",
      action: "https://www.ovh.com/auth/",
      actionText: "Accéder à OVH"
    },
    {
      title: "Accéder à la section API",
      description: "Dans le menu, allez dans 'API & Services' > 'API Access'.",
      code: null
    },
    {
      title: "Créer une nouvelle application",
      description: "Cliquez sur 'Create a new application' et remplissez les informations.",
      code: null
    },
    {
      title: "Configurer les permissions",
      description: "Lors de la création de la clé de consommateur, sélectionnez les permissions suivantes :",
      permissions: [
        "GET /telephony",
        "GET /telephony/{billingAccount}/line",
        "GET /telephony/{billingAccount}/line/{lineNumber}",
        "GET /telephony/{billingAccount}/line/{lineNumber}/forwarding/unconditional",
        "PUT /telephony/{billingAccount}/line/{lineNumber}/forwarding/unconditional",
        "GET /telephony/{billingAccount}/line/{lineNumber}/forwarding/busy",
        "PUT /telephony/{billingAccount}/line/{lineNumber}/forwarding/busy",
        "GET /telephony/{billingAccount}/line/{lineNumber}/forwarding/noReply",
        "PUT /telephony/{billingAccount}/line/{lineNumber}/forwarding/noReply",
        "GET /telephony/{billingAccount}/line/{lineNumber}/noReplyTimer",
        "PUT /telephony/{billingAccount}/line/{lineNumber}/noReplyTimer"
      ]
    },
    {
      title: "Mettre à jour les variables d'environnement",
      description: "Copiez vos clés dans le fichier .env de votre application :",
      envVars: [
        "VITE_OVH_APP_KEY=votre_app_key_ici",
        "VITE_OVH_APP_SECRET=votre_app_secret_ici",
        "VITE_OVH_CONSUMER_KEY=votre_consumer_key_ici"
      ]
    }
  ];

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showSuccess("Copié dans le presse-papiers");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Card className="max-w-2xl w-full mx-4">
      <CardHeader>
        <CardTitle className="text-xl">Configuration des clés API OVH</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <p className="text-gray-600">
            Suivez ces étapes pour configurer correctement l'accès à l'API OVH :
          </p>
          
          <ol className="space-y-4">
            {steps.map((step, index) => (
              <li key={index} className="border-l-4 border-primary pl-4 py-1">
                <div className="font-medium text-gray-900">{index + 1}. {step.title}</div>
                <p className="text-gray-600 text-sm mt-1">{step.description}</p>
                
                {step.action && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 h-auto mt-2"
                    onClick={() => window.open(step.action, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    {step.actionText}
                  </Button>
                )}
                
                {step.permissions && (
                  <div className="mt-2 space-y-2">
                    {step.permissions.map((perm, permIndex) => (
                      <div 
                        key={permIndex} 
                        className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm font-mono"
                      >
                        <code className="text-gray-800">{perm}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(perm, `perm-${index}-${permIndex}`)}
                        >
                          {copiedIndex === `perm-${index}-${permIndex}` ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {step.envVars && (
                  <div className="mt-2 space-y-2">
                    {step.envVars.map((envVar, envIndex) => (
                      <div 
                        key={envIndex} 
                        className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm font-mono"
                      >
                        <code className="text-gray-800">{envVar}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(envVar, `env-${index}-${envIndex}`)}
                        >
                          {copiedIndex === `env-${index}-${envIndex}` ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mt-4">
            <h4 className="font-bold text-yellow-800 mb-2">Important</h4>
            <p className="text-yellow-700 text-sm">
              Après avoir mis à jour les variables d'environnement, redémarrez l'application 
              pour que les changements prennent effet.
            </p>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={onClose}>Fermer</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OvhSetupGuide;