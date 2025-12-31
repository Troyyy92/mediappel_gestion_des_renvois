import { showSuccess, showError } from "@/utils/toast";

// Type pour les erreurs de l'API OVH
interface OvhApiError {
  message: string;
  errorCode: string;
  httpCode: string;
}

// Type pour les lignes SIP
interface OvhSipLine {
  serviceName: string;
  lineNumber: string;
  description: string;
}

// Type pour les options de renvoi
interface OvhForwardingOptions {
  forwarding: {
    unconditional: {
      active: boolean;
      destination?: string;
    };
    busy: {
      active: boolean;
      destination?: string;
    };
    noReply: {
      active: boolean;
      destination?: string;
    };
  };
  noReplyTimer: number;
}

class OvhApiClient {
  private appKey: string;
  private appSecret: string;
  private consumerKey: string;
  private baseUrl: string;

  constructor() {
    // Récupération des clés depuis les variables d'environnement
    this.appKey = import.meta.env.VITE_OVH_APP_KEY || "";
    this.appSecret = import.meta.env.VITE_OVH_APP_SECRET || "";
    this.consumerKey = import.meta.env.VITE_OVH_CONSUMER_KEY || "";
    this.baseUrl = "https://eu.api.ovh.com/1.0";
    
    // Vérification des clés
    if (!this.appKey || !this.appSecret || !this.consumerKey) {
      console.warn("OVH API keys are missing. Please check your environment variables.");
    }
  }

  // Méthode pour effectuer les requêtes API
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Vérifier que les clés sont présentes
    if (!this.appKey || !this.appSecret || !this.consumerKey) {
      throw new Error("OVH API keys are missing. Please check your environment variables.");
    }
    
    const defaultHeaders = {
      "X-Ovh-Application": this.appKey,
      "X-Ovh-Timestamp": Math.round(Date.now() / 1000).toString(),
      "Content-Type": "application/json",
      "X-Ovh-Consumer": this.consumerKey,
    };
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };
    
    try {
      console.log(`Making request to: ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorData: OvhApiError;
        try {
          errorData = await response.json();
        } catch (e) {
          throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        throw new Error(`OVH API Error: ${errorData.message} (${errorData.httpCode})`);
      }
      
      const data = await response.json();
      console.log(`Response from ${url}:`, data);
      return data;
    } catch (error) {
      console.error("OVH API Request failed:", error);
      throw error;
    }
  }

  // Récupérer la liste des lignes SIP
  async getSipLines(): Promise<OvhSipLine[]> {
    try {
      // Vérifier que les clés sont présentes
      if (!this.appKey || !this.appSecret || !this.consumerKey) {
        throw new Error("OVH API keys are missing. Please check your environment variables.");
      }
      
      // Récupération des billing accounts
      const billingAccounts: string[] = await this.makeRequest("/telephony");
      console.log("Billing accounts:", billingAccounts);
      
      const allLines: OvhSipLine[] = [];
      
      // Pour chaque compte de facturation, récupérer les lignes
      for (const billingAccount of billingAccounts) {
        try {
          const lines: string[] = await this.makeRequest(`/telephony/${billingAccount}/line`);
          console.log(`Lines for ${billingAccount}:`, lines);
          
          // Récupérer les détails de chaque ligne
          for (const lineNumber of lines) {
            try {
              const lineDetails: any = await this.makeRequest(`/telephony/${billingAccount}/line/${lineNumber}`);
              console.log(`Line details for ${lineNumber}:`, lineDetails);
              
              allLines.push({
                serviceName: billingAccount,
                lineNumber: lineDetails.lineNumber,
                description: lineDetails.description || `Ligne ${lineDetails.lineNumber}`,
              });
            } catch (lineError) {
              console.warn(`Failed to fetch details for line ${lineNumber}:`, lineError);
            }
          }
        } catch (accountError) {
          console.warn(`Failed to fetch lines for billing account ${billingAccount}:`, accountError);
        }
      }
      
      return allLines;
    } catch (error) {
      console.error("Error fetching SIP lines:", error);
      throw error;
    }
  }

  // Récupérer les options de renvoi pour une ligne spécifique
  async getSipLineOptions(serviceName: string, lineNumber: string): Promise<OvhForwardingOptions> {
    try {
      // Vérifier que les clés sont présentes
      if (!this.appKey || !this.appSecret || !this.consumerKey) {
        throw new Error("OVH API keys are missing. Please check your environment variables.");
      }
      
      // Récupération des paramètres de renvoi
      const unconditional = await this.makeRequest<any>(`/telephony/${serviceName}/line/${lineNumber}/forwarding/unconditional`);
      const busy = await this.makeRequest<any>(`/telephony/${serviceName}/line/${lineNumber}/forwarding/busy`);
      const noReply = await this.makeRequest<any>(`/telephony/${serviceName}/line/${lineNumber}/forwarding/noReply`);
      
      // Récupération du délai de non-réponse
      const noReplyTimer = await this.makeRequest<any>(`/telephony/${serviceName}/line/${lineNumber}/noReplyTimer`);
      
      return {
        forwarding: {
          unconditional: {
            active: unconditional.enabled,
            destination: unconditional.destination,
          },
          busy: {
            active: busy.enabled,
            destination: busy.destination,
          },
          noReply: {
            active: noReply.enabled,
            destination: noReply.destination,
          },
        },
        noReplyTimer: noReplyTimer.timeout,
      };
    } catch (error) {
      console.error(`Error fetching options for line ${lineNumber}:`, error);
      throw error;
    }
  }

  // Mettre à jour les options de renvoi
  async updateForwarding(
    serviceName: string,
    lineNumber: string,
    type: "unconditional" | "busy" | "noReply",
    destination: string | null
  ): Promise<void> {
    try {
      // Vérifier que les clés sont présentes
      if (!this.appKey || !this.appSecret || !this.consumerKey) {
        throw new Error("OVH API keys are missing. Please check your environment variables.");
      }
      
      const endpoint = `/telephony/${serviceName}/line/${lineNumber}/forwarding/${type}`;
      
      if (destination) {
        // Activer le renvoi
        await this.makeRequest(endpoint, {
          method: "PUT",
          body: JSON.stringify({
            enabled: true,
            destination: destination,
          }),
        });
        showSuccess(`Renvoi ${type} activé vers ${destination}`);
      } else {
        // Désactiver le renvoi
        await this.makeRequest(endpoint, {
          method: "PUT",
          body: JSON.stringify({
            enabled: false,
          }),
        });
        showSuccess(`Renvoi ${type} désactivé`);
      }
    } catch (error) {
      console.error(`Error updating forwarding for ${type}:`, error);
      showError(`Erreur lors de la mise à jour du renvoi ${type}`);
      throw error;
    }
  }

  // Mettre à jour le délai de non-réponse
  async updateNoReplyTimer(
    serviceName: string,
    lineNumber: string,
    timer: number
  ): Promise<void> {
    try {
      // Vérifier que les clés sont présentes
      if (!this.appKey || !this.appSecret || !this.consumerKey) {
        throw new Error("OVH API keys are missing. Please check your environment variables.");
      }
      
      const endpoint = `/telephony/${serviceName}/line/${lineNumber}/noReplyTimer`;
      
      await this.makeRequest(endpoint, {
        method: "PUT",
        body: JSON.stringify({
          timeout: timer,
        }),
      });
      
      showSuccess(`Délai de non-réponse mis à jour à ${timer} secondes`);
    } catch (error) {
      console.error("Error updating no reply timer:", error);
      showError("Erreur lors de la mise à jour du délai de non-réponse");
      throw error;
    }
  }

  // Désactiver tous les renvois
  async resetAllForwarding(serviceName: string, lineNumber: string): Promise<void> {
    try {
      // Vérifier que les clés sont présentes
      if (!this.appKey || !this.appSecret || !this.consumerKey) {
        throw new Error("OVH API keys are missing. Please check your environment variables.");
      }
      
      // Désactiver chaque type de renvoi
      await this.updateForwarding(serviceName, lineNumber, "unconditional", null);
      await this.updateForwarding(serviceName, lineNumber, "busy", null);
      await this.updateForwarding(serviceName, lineNumber, "noReply", null);
      
      showSuccess("Tous les renvois ont été désactivés");
    } catch (error) {
      console.error("Error resetting all forwarding:", error);
      showError("Erreur lors de la réinitialisation des renvois");
      throw error;
    }
  }
}

// Exporter une instance du client
export const ovhClient = new OvhApiClient();