import { showSuccess, showError } from "@/utils/toast";

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
  private baseUrl: string;

  constructor() {
    // Détection automatique : app Dyad ou navigateur
    const isDyadApp = window.location.protocol === 'capacitor:' || 
                      window.location.protocol === 'ionic:' ||
                      window.location.hostname === '';
    
    // Utilise l'IP locale pour l'app Dyad, localhost pour le navigateur
    const backendHost = isDyadApp ? '192.168.1.11' : 'localhost';
    
    this.baseUrl = `http://${backendHost}:3001/api`;
    
    console.log(`🔗 Backend URL: ${this.baseUrl}`);
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      console.log(`Making request to backend: ${url}`);
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Response from ${url}:`, data);
      return data;
    } catch (error) {
      console.error("Backend API Request failed:", error);
      throw error;
    }
  }

  async getSipLines(): Promise<OvhSipLine[]> {
    try {
      return await this.makeRequest<OvhSipLine[]>("/telephony/lines");
    } catch (error) {
      console.error("Error fetching SIP lines:", error);
      throw error;
    }
  }

  async getSipLineOptions(serviceName: string, lineNumber: string): Promise<OvhForwardingOptions> {
    try {
      return await this.makeRequest<OvhForwardingOptions>(
        `/telephony/${serviceName}/line/${lineNumber}/options`
      );
    } catch (error) {
      console.error(`Error fetching options for line ${lineNumber}:`, error);
      throw error;
    }
  }

  async updateForwarding(
    serviceName: string,
    lineNumber: string,
    type: "unconditional" | "busy" | "noReply",
    destination: string | null
  ): Promise<void> {
    try {
      await this.makeRequest(`/telephony/${serviceName}/line/${lineNumber}/forwarding`, {
        method: "PUT",
        body: JSON.stringify({ type, destination }),
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

  async updateNoReplyTimer(serviceName: string, lineNumber: string, timer: number): Promise<void> {
    try {
      await this.makeRequest(`/telephony/${serviceName}/line/${lineNumber}/no-reply-timer`, {
        method: "PUT",
        body: JSON.stringify({ timer }),
      });
      
      showSuccess(`Délai de non-réponse mis à jour à ${timer} secondes`);
    } catch (error) {
      console.error("Error updating no reply timer:", error);
      showError("Erreur lors de la mise à jour du délai de non-réponse");
      throw error;
    }
  }

  async resetAllForwarding(serviceName: string, lineNumber: string): Promise<void> {
    try {
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

export const ovhClient = new OvhApiClient();