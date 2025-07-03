
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função para validar formato da chave API Pagar.me
function isValidPagarmeApiKey(apiKey: string): boolean {
  return typeof apiKey === 'string' && 
         apiKey.startsWith('sk_') && 
         apiKey.length > 10;
}

serve(async (req) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] === NOVA REQUISIÇÃO ===`);
  console.log(`[${timestamp}] Método: ${req.method}`);
  console.log(`[${timestamp}] URL: ${req.url}`);
  console.log(`[${timestamp}] Headers:`, Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${timestamp}] Respondendo a requisição OPTIONS (CORS preflight)`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar se há body na requisição
    let body;
    try {
      const text = await req.text();
      console.log(`[${timestamp}] Body recebido (texto):`, text);
      
      if (!text || text.trim() === '') {
        throw new Error('Body da requisição está vazio');
      }
      
      body = JSON.parse(text);
      console.log(`[${timestamp}] Body parseado:`, body);
    } catch (parseError) {
      console.error(`[${timestamp}] Erro ao parsear JSON:`, parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Formato de dados inválido',
          details: 'O corpo da requisição deve ser um JSON válido',
          debug: { parseError: parseError.message }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const { endpoint, apiKey } = body;
    
    console.log(`[${timestamp}] Dados extraídos:`, {
      endpoint: endpoint,
      apiKeyPresente: !!apiKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 5) + '...' : 'N/A'
    });
    
    if (!endpoint) {
      console.error(`[${timestamp}] Endpoint ausente`);
      return new Response(
        JSON.stringify({ 
          error: 'Endpoint obrigatório',
          details: 'O parâmetro "endpoint" é obrigatório na requisição'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!apiKey) {
      console.error(`[${timestamp}] API key ausente`);
      return new Response(
        JSON.stringify({ 
          error: 'Chave API obrigatória',
          details: 'O parâmetro "apiKey" é obrigatório na requisição'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validar formato da chave API
    if (!isValidPagarmeApiKey(apiKey)) {
      console.error(`[${timestamp}] Formato da chave API inválido:`, {
        apiKey: apiKey.substring(0, 10) + '...',
        startsWithSk: apiKey.startsWith('sk_'),
        length: apiKey.length
      });
      return new Response(
        JSON.stringify({ 
          error: 'Formato da chave API inválido',
          details: 'A chave deve começar com "sk_" e ter o formato correto da Pagar.me',
          debug: {
            startsWithSk: apiKey.startsWith('sk_'),
            length: apiKey.length,
            expected: 'sk_xxxxxxxxxxxxxxxxx'
          }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const fullUrl = `https://api.pagar.me${endpoint}`;
    console.log(`[${timestamp}] URL completa para requisição:`, fullUrl);
    
    const requestHeaders = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Lovable-Pagarme-Integration/1.0',
    };
    
    console.log(`[${timestamp}] Headers da requisição:`, {
      ...requestHeaders,
      'Authorization': 'Bearer ' + apiKey.substring(0, 10) + '...'
    });

    console.log(`[${timestamp}] Fazendo requisição para API Pagar.me...`);
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: requestHeaders,
    });

    console.log(`[${timestamp}] Resposta recebida:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    const responseText = await response.text();
    console.log(`[${timestamp}] Texto da resposta:`, responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log(`[${timestamp}] Dados parseados:`, data);
    } catch (e) {
      console.error(`[${timestamp}] Erro ao parsear resposta da API:`, e);
      data = { raw_response: responseText };
    }
    
    if (!response.ok) {
      console.error(`[${timestamp}] Erro na resposta da API Pagar.me:`, {
        status: response.status,
        statusText: response.statusText,
        data: data
      });

      let errorMessage = `Erro HTTP ${response.status}`;
      let errorDetails = data;

      // Tratar erros específicos da Pagar.me
      if (response.status === 401) {
        errorMessage = 'Chave da API inválida ou sem permissões';
        errorDetails = 'Verifique se sua chave API está correta e tem as permissões necessárias. Certifique-se de que é uma chave SECRET (sk_) e não PUBLIC (pk_)';
      } else if (response.status === 403) {
        errorMessage = 'Acesso negado';
        errorDetails = 'Sua chave API não tem permissão para acessar este recurso';
      } else if (response.status === 404) {
        errorMessage = 'Recurso não encontrado';
        errorDetails = 'O endpoint solicitado não existe ou não está disponível';
      } else if (response.status >= 500) {
        errorMessage = 'Erro interno da API Pagar.me';
        errorDetails = 'Tente novamente em alguns minutos';
      }

      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: errorDetails,
          status: response.status,
          debug: {
            endpoint: endpoint,
            fullUrl: fullUrl,
            responseData: data
          }
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`[${timestamp}] === SUCESSO === Dados recebidos com sucesso da API Pagar.me`);
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error(`[${timestamp}] === ERRO CRÍTICO ===`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    
    let errorMessage = 'Erro interno do servidor';
    let errorDetails = error.message;

    // Tratar diferentes tipos de erro
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = 'Erro de conexão com a API Pagar.me';
      errorDetails = 'Não foi possível conectar com a API. Verifique sua conexão com a internet';
    } else if (error.message.includes('JSON')) {
      errorMessage = 'Erro ao processar dados';
      errorDetails = 'Dados inválidos recebidos na requisição';
    } else if (error.message.includes('network')) {
      errorMessage = 'Erro de rede';
      errorDetails = 'Problema de conectividade. Tente novamente';
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails,
        timestamp: timestamp,
        debug: {
          errorName: error.name,
          errorMessage: error.message,
          stack: error.stack?.substring(0, 500)
        }
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
