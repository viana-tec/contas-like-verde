
export interface PagarmeProxyRequest {
  endpoint: string;
  apiKey: string;
}

export interface ErrorResponse {
  error: string;
  details: string;
  status?: number;
  timestamp?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
} as const;
