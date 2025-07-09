
import { corsHeaders, PagarmeProxyRequest } from './types.ts';
import { handleApiError, handleFetchError, createErrorResponse } from './error-handler.ts';

export async function parseRequestBody(req: Request): Promise<PagarmeProxyRequest> {
  const text = await req.text();
  console.log(`📝 Body recebido (${text.length} chars):`, text.substring(0, 200));
  
  if (!text?.trim()) {
    throw new Error('Body vazio');
  }
  
  const body = JSON.parse(text);
  console.log(`✅ Body parseado:`, { 
    hasEndpoint: !!body.endpoint, 
    hasApiKey: !!body.apiKey,
    keyLength: body.apiKey?.length || 0 
  });

  return body;
}

export async function makeApiRequest(
  endpoint: string, 
  apiKey: string, 
  timestamp: string
): Promise<Response> {
  const baseUrl = 'https://api.pagar.me';
  const fullUrl = `${baseUrl}${endpoint}`;
  console.log(`🌐 URL construída: ${fullUrl}`);
  
  // Headers da requisição - API v5 usa Basic Auth (não Bearer)
  const requestHeaders = {
    'Authorization': `Basic ${btoa(`${apiKey.trim()}:`)}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'Lovable-Integration/1.0',
  };
  
  console.log(`📤 Fazendo requisição...`);

  // Requisição com timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log(`⏰ Timeout atingido`);
    controller.abort();
  }, 25000);
  
  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: requestHeaders,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log(`📥 Resposta: ${response.status} ${response.statusText}`);

    const responseText = await response.text();
    console.log(`📄 Response (${responseText.length} chars):`, responseText.substring(0, 300));
    
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error(`⚠️ Erro parse JSON:`, e);
      return createErrorResponse(
        'Resposta inválida da API',
        'API não retornou JSON válido',
        502,
        timestamp
      );
    }
    
    if (!response.ok) {
      return handleApiError(response, data, timestamp);
    }

    console.log(`🎉 SUCESSO! Dados recebidos`);
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (fetchError: any) {
    clearTimeout(timeoutId);
    return handleFetchError(fetchError, timestamp);
  }
}
