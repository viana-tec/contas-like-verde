
import { corsHeaders, ErrorResponse } from './types.ts';

export function createErrorResponse(
  error: string,
  details: string,
  status: number = 500,
  timestamp?: string
): Response {
  console.error(`🚨 [ERROR] Criando resposta de erro: ${status} - ${error}`);
  
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
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      } 
    }
  );
}

export function handleApiError(response: Response, data: any, timestamp: string): Response {
  console.error(`❌ [API_ERROR] Erro HTTP ${response.status}:`, data);

  let errorMessage = `Erro ${response.status}`;
  let errorDetails = 'Erro na API Pagar.me';

  switch (response.status) {
    case 400:
      errorMessage = 'Requisição inválida';
      errorDetails = data?.message || 'Parâmetros inválidos enviados para a API';
      break;
    case 401:
      errorMessage = 'Chave API inválida';
      errorDetails = 'Verifique sua chave de API no dashboard da Pagar.me';
      break;
    case 403:
      errorMessage = 'Acesso negado';
      errorDetails = 'Chave de API sem permissões necessárias';
      break;
    case 404:
      errorMessage = 'Endpoint não encontrado';
      errorDetails = 'Verifique se o endpoint está correto';
      break;
    case 422:
      errorMessage = 'Parâmetros inválidos';
      errorDetails = data?.message || 'Verifique os parâmetros enviados';
      break;
    case 429:
      errorMessage = 'Limite de requisições excedido';
      errorDetails = 'Aguarde alguns momentos antes de tentar novamente';
      break;
    case 500:
      errorMessage = 'Erro interno da Pagar.me';
      errorDetails = 'Tente novamente em alguns minutos';
      break;
    default:
      if (response.status >= 500) {
        errorMessage = 'Erro interno da Pagar.me';
        errorDetails = 'Serviço temporariamente indisponível';
      }
  }

  return createErrorResponse(errorMessage, errorDetails, response.status, timestamp);
}

export function handleFetchError(error: any, timestamp: string): Response {
  console.error(`❌ [FETCH_ERROR] Erro na requisição:`, error);
  
  if (error.name === 'AbortError') {
    console.error(`⏰ [FETCH_ERROR] Timeout na requisição`);
    return createErrorResponse(
      'Timeout na requisição',
      'A requisição demorou mais que 30 segundos',
      408,
      timestamp
    );
  }
  
  if (error.message?.includes('network')) {
    return createErrorResponse(
      'Erro de rede',
      'Falha na conexão com a API Pagar.me',
      502,
      timestamp
    );
  }
  
  return createErrorResponse(
    'Erro de comunicação',
    error.message || 'Erro desconhecido na requisição',
    500,
    timestamp
  );
}

export function handleParseError(parseError: any): Response {
  console.error(`❌ [PARSE_ERROR] Erro no parse:`, parseError);
  return createErrorResponse(
    'JSON inválido',
    'Corpo da requisição deve conter JSON válido',
    400
  );
}
