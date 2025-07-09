
import { corsHeaders, PagarmeProxyRequest } from './types.ts';
import { handleApiError, handleFetchError, createErrorResponse } from './error-handler.ts';

export async function parseRequestBody(req: Request): Promise<PagarmeProxyRequest> {
  console.log(`📝 [PARSE] Lendo body da requisição...`);
  
  const text = await req.text();
  console.log(`📝 [PARSE] Body recebido (${text.length} chars):`, text.substring(0, 500));
  
  if (!text?.trim()) {
    throw new Error('Body da requisição está vazio');
  }
  
  try {
    const body = JSON.parse(text);
    console.log(`✅ [PARSE] JSON parseado com sucesso`);
    console.log(`📋 [PARSE] Dados recebidos:`, { 
      hasEndpoint: !!body.endpoint, 
      hasApiKey: !!body.apiKey,
      endpointLength: body.endpoint?.length || 0,
      keyLength: body.apiKey?.length || 0 
    });

    return body;
  } catch (jsonError) {
    console.error(`❌ [PARSE] Erro no parse JSON:`, jsonError);
    throw new Error('JSON inválido no body da requisição');
  }
}

export async function makeApiRequest(
  endpoint: string, 
  apiKey: string, 
  timestamp: string
): Promise<Response> {
  const baseUrl = 'https://api.pagar.me';
  const fullUrl = `${baseUrl}${endpoint}`;
  
  console.log(`🌐 [REQUEST] URL construída: ${fullUrl}`);
  console.log(`🔑 [REQUEST] Usando chave: ${apiKey.substring(0, 10)}...`);
  
  // Headers da requisição - API v5 usa Basic Auth
  const requestHeaders = {
    'Authorization': `Basic ${btoa(`${apiKey.trim()}:`)}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'Supabase-Edge-Function/1.0',
  };
  
  console.log(`📤 [REQUEST] Headers configurados`);
  console.log(`📤 [REQUEST] Fazendo requisição GET para Pagar.me...`);

  // Timeout mais longo para requisições grandes
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log(`⏰ [REQUEST] Timeout de 30s atingido`);
    controller.abort();
  }, 30000);
  
  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: requestHeaders,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    console.log(`📥 [REQUEST] Resposta recebida: ${response.status} ${response.statusText}`);
    console.log(`📥 [REQUEST] Headers da resposta:`, Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log(`📄 [REQUEST] Response body (${responseText.length} chars):`, responseText.substring(0, 500));
    
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
      console.log(`✅ [REQUEST] JSON da resposta parseado com sucesso`);
    } catch (parseError) {
      console.error(`❌ [REQUEST] Erro no parse do JSON da resposta:`, parseError);
      return createErrorResponse(
        'Resposta inválida da API',
        'API Pagar.me não retornou JSON válido',
        502,
        timestamp
      );
    }
    
    if (!response.ok) {
      console.error(`❌ [REQUEST] Erro HTTP ${response.status}:`, data);
      return handleApiError(response, data, timestamp);
    }

    console.log(`🎉 [REQUEST] SUCESSO! Dados recebidos da API`);
    
    // Log dos dados para debug
    if (data?.data) {
      console.log(`📊 [REQUEST] Dados recebidos: ${data.data.length} registros`);
      if (data.data.length > 0) {
        console.log(`📋 [REQUEST] Primeiro registro:`, data.data[0]);
      }
    }
    
    return new Response(
      JSON.stringify(data),
      { 
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (fetchError: any) {
    clearTimeout(timeoutId);
    console.error(`❌ [REQUEST] Erro na requisição:`, fetchError);
    return handleFetchError(fetchError, timestamp);
  }
}
