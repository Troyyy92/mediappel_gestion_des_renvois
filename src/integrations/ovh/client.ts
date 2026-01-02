import CryptoJS from "crypto-js";
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

  // ⭐ NOUVELLE MÉTHODE : Générer la signature OVH
  private generateSignature(
    method: string,
    url: string,
    body: string,
    timestamp: string
  ): string {
    const toSign = `${this.appSecret}+${this.consumerKey}+${method}+${url}+${body}+${timestamp}`;
    const hash = CryptoJS.SHA1(toSign).toString();
    return `$1$${hash}`;
  }

  // Méthode pour effectuer les requêtes API (MODIFIÉE)
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const method = options.method || "GET";
    const body = options.body ? String(options.body) : "";
    
    // Vérifier que les clés sont présentes
    if (!this.appKey || !this.appSecret || !this.consumerKey) {
      throw new Error("OVH API keys are missing. Please check your environment variables.");
    }
    
    const timestamp = Math.round(Date.now() / 1000).toString();
    const signature = this.generateSignature(method, url, body, timestamp);
    
    const defaultHeaders = {
      "X-Ovh-Application": this.appKey,
      "X-Ovh-Consumer": this.consumerKey,
      "X-Ovh-Timestamp": timestamp,
      "X-Ovh-Signature": signature, // ⭐ AJOUT DE LA SIGNATURE
      "Content-Type": "application/json",
    };
    
    const config: RequestInit = {
      ...options,
      method,
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
      const unconditional = await this.makeRequest<any>(`/telephony/${serviceName}/line/${lineNumber}/options`);
      
      return {
        forwarding: {
          unconditional: {
            active: unconditional.forwardUnconditional || false,
            destination: unconditional.forwardUnconditionalNumber,
          },
          busy: {
            active: unconditional.forwardBusy || false,
            destination: unconditional.forwardBusyNumber,
          },
          noReply: {
            active: unconditional.forwardNoReply || false,
            destination: unconditional.forwardNoReplyNumber,
          },
        },
        noReplyTimer: unconditional.forwardNoReplyDelay || 20,
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
      
      const endpoint = `/telephony/${serviceName}/line/${lineNumber}/options`;
      
      // Récupérer les options actuelles
      const currentOptions = await this.makeRequest<any>(endpoint);
      
      // Préparer les nouvelles options selon le type
      let updateData: any = {};
      
      if (type === "unconditional") {
        updateData = {
          forwardUnconditional: !!destination,
          forwardUnconditionalNumber: destination || "",
        };
      } else if (type === "busy") {
        updateData = {
          forwardBusy: !!destination,
          forwardBusyNumber: destination || "",
        };
      } else if (type === "noReply") {
        updateData = {
          forwardNoReply: !!destination,
          forwardNoReplyNumber: destination || "",
        };
      }
      
      await this.makeRequest(endpoint, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });
      
      if (destination) {
        showSuccess(`Renvoi ${type} activé vers ${destination}`);
      } else {
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
      
      const endpoint = `/telephony/${serviceName}/line/${lineNumber}/options`;
      
      await this.makeRequest(endpoint, {
        method: "PUT",
        body: JSON.stringify({
          forwardNoReplyDelay: timer,
        }),
      });
      
      showSuccess(`Délai de non-réponse mis à jour à ${timer} secondes`);
    } catch (error) {
      console.error("Error updating no reply timer:", error);
      showError("Erreur lors de la mise