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
    this.appKey = import.meta.env.VITE_OVH_APP_KEY || "";
    this.appSecret = import.meta.env.VITE_OVH_APP_SECRET || "";
    this.consumerKey = import.meta.env.VITE_OVH_CONSUMER_KEY || "";
    this.baseUrl = "https://eu.api.ovh.com/1.0";
    
    if (!this.appKey || !this.appSecret || !this.consumerKey) {
      console.warn("OVH API keys are missing. Please check your environment variables.");
    }
  }

  private generateSignature(method: string, url: string, body: string, timestamp: string): string {
    const toSign = `${this.appSecret}+${this.consumerKey}+${method}+${url}+${body}+${timestamp}`;
    const hash = CryptoJS.SHA1(toSign).toString();
    return `$1$${hash}`;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const method = options.method || "GET";
    const body = options.body ? String(options.body) : "";
    
    if (!this.appKey || !this.appSecret || !this.consumerKey) {
      throw new Error("Clés API OVH manquantes.");
    }
    
    const timestamp = Math.round(Date.now() / 1000).toString();
    const signature = this.generateSignature(method, url, body, timestamp);
    
    const defaultHeaders = {
      "X-Ovh-Application": this.appKey,
      "X-Ovh-Consumer": this.consumerKey,
      "X-Ovh-Timestamp": timestamp,
      "X-Ovh-Signature": signature,
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
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorData: OvhApiError;
        try {
          errorData = await response.json();
        } catch (e) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        throw new Error(errorData.message || `Erreur API OVH (${response.status})`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("OVH API Request failed:", error);
      throw error;
    }
  }

  async getSipLines(): Promise<OvhSipLine[]> {
    try {
      const billingAccounts: string[] = await this.makeRequest("/telephony");
      const allLines: OvhSipLine[] = [];
      
      for (const billingAccount of billingAccounts) {
        try {
          const lines: string[] = await this.makeRequest(`/telephony/${billingAccount}/line`);
          
          for (const lineId of lines) {
            try {
              const details: any = await this.makeRequest(`/telephony/${billingAccount}/line/${lineId}`);
              
              // On utilise lineId (qui est le numéro) si details.lineNumber est absent
              const finalNumber = details.lineNumber || lineId;
              
              allLines.push({
                serviceName: billingAccount,
                lineNumber: finalNumber,
                description: details.description || `Ligne ${finalNumber}`,
              });
            } catch (err) {
              console.warn(`Détails indisponibles pour ${lineId}`);
            }
          }
        } catch (err) {
          console.warn(`Erreur pour le compte ${billingAccount}`);
        }
      }
      
      return allLines;
    } catch (error) {
      console.error("Error fetching SIP lines:", error);
      throw error;
    }
  }

  async getSipLineOptions(serviceName: string, lineNumber: string): Promise<OvhForwardingOptions> {
    const options = await this.makeRequest<any>(`/telephony/${serviceName}/line/${lineNumber}/options`);
    
    return {
      forwarding: {
        unconditional: {
          active: options.forwardUnconditional || false,
          destination: options.forwardUnconditionalNumber,
        },
        busy: {
          active: options.forwardBusy || false,
          destination: options.forwardBusyNumber,
        },
        noReply: {
          active: options.forwardNoReply || false,
          destination: options.forwardNoReplyNumber,
        },
      },
      noReplyTimer: options.forwardNoReplyDelay || 20,
    };
  }

  async updateForwarding(serviceName: string, lineNumber: string, type: "unconditional" | "busy" | "noReply", destination: string | null): Promise<void> {
    const endpoint = `/telephony/${serviceName}/line/${lineNumber}/options`;
    let updateData: any = {};
    
    if (type === "unconditional") {
      updateData = { forwardUnconditional: !!destination, forwardUnconditionalNumber: destination || "" };
    } else if (type === "busy") {
      updateData = { forwardBusy: !!destination, forwardBusyNumber: destination || "" };
    } else if (type === "noReply") {
      updateData = { forwardNoReply: !!destination, forwardNoReplyNumber: destination || "" };
    }
    
    await this.makeRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
    
    showSuccess(destination ? `Renvoi ${type} activé` : `Renvoi ${type} désactivé`);
  }

  async updateNoReplyTimer(serviceName: string, lineNumber: string, timer: number): Promise<void> {
    const endpoint = `/telephony/${serviceName}/line/${lineNumber}/options`;
    await this.makeRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify({ forwardNoReplyDelay: timer }),
    });
    showSuccess(`Délai mis à jour : ${timer}s`);
  }

  async resetAllForwarding(serviceName: string, lineNumber: string): Promise<void> {
    await this.updateForwarding(serviceName, lineNumber, "unconditional", null);
    await this.updateForwarding(serviceName, lineNumber, "busy", null);
    await this.updateForwarding(serviceName, lineNumber, "noReply", null);
    showSuccess("Tous les renvois désactivés");
  }
}

export const ovhClient = new OvhApiClient();