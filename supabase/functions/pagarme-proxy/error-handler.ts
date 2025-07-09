
import { corsHeaders, ErrorResponse } from './types.ts';

export function createErrorResponse(
  error: string,
  details: string,
  status: number = 500,
  timestamp?: string
): Response {
  const errorResponse: ErrorResponse = {
    error,
    details,
    status,
    timestamp: timestamp || new Date().toISOString()
  };

  return new Response(
    JSON.stringify(errorResponse),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

export function handleApiError(response: Response, data: any, timestamp: string): Response {
  console.error(`❌ Erro HTTP ${response.status}:`, data);

  let errorMessage = `Erro ${response.status}`;
  let errorDetails = 'Erro na API Pagar.me';

  switch (response.status) {
    case 401:
      errorMessage = 'Chave API inválida';
      errorDetails = 'Verifique sua chave no dashboard Pagar.me';
      break;
    case 403:
      errorMessage = 'Acesso negado';
      errorDetails = 'Chave sem permissões necessárias';
      break;
    case 404:
      errorMessage = 'Endpoint não encontrado';
      errorDetails = 'Verifique a URL da API';
      break;
    case 422:
      errorMessage = 'Parâmetros inválidos';
      errorDetails = data?.message || 'Verifique os parâmetros enviados';
      break;
    case 429:
      errorMessage = 'Limite de requisições';
      errorDetails = 'Aguarde antes de tentar novamente';
      break;
    default:
      if (response.status >= 500) {
        errorMessage = 'Erro interno da Pagar.me';
        errorDetails = 'Tente novamente em alguns minutos';
      }
  }

  return createErrorResponse(errorMessage, errorDetails, response.status, timestamp);
}

export function handleFetchError(error: any, timestamp: string): Response {
  if (error.name === 'AbortError') {
    console.error(`⏰ Timeout na requisição`);
    return createErrorResponse(
      'Timeout',
      'Requisição demorou mais que 25 segundos',
      408,
      timestamp
    );
  }
  
  console.error(`💥 Erro na requisição:`, error);
  throw error;
}

export function handleParseError(parseError: any): Response {
  console.error(`💥 Erro no parse:`, parseError);
  return createErrorResponse(
    'JSON inválido',
    'Corpo da requisição deve ser JSON válido',
    400
  );
}
