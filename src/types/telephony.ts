export type ForwardingType = "unconditional" | "busy" | "noReply";

export interface ForwardingOption {
  type: ForwardingType;
  active: boolean;
  destination?: string; // Le numéro de renvoi
}

export interface SipLineOptions {
  lineNumber: string;
  serviceName: string;
  forwarding: {
    unconditional: ForwardingOption;
    busy: ForwardingOption;
    noReply: ForwardingOption;
  };
  noReplyTimer: number; // Délai avant renvoi sur non-réponse (0-60s)
}

export interface SipLine {
  serviceName: string;
  lineNumber: string;
  description: string;
}

export interface SavedNumber {
  id: string;
  name: string;
  number: string;
}