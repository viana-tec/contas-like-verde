
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função para validar formato da chave API Pagar.me
function isValidPagarmeApiKey(apiKey: string): boolean {
  return typeof apiKey === 'string' && 
         (apiKey.startsWith('sk_test_') || apiKey.startsWith('sk_live_')) && 
         apiKey.length > 20;
}

// Função para codificar em Base64 para Basic Auth
function encodeBasicAuth(apiKey: string): string {
  return btoa(`${apiKey}:`);
}

serve(async (req) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] === NOVA REQUISIÇÃO ===`);
  console.log(`[${timestamp}] Método: ${req.method}`);
  console.log(`[${timestamp}] URL: ${req.url}`);
  
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
      console.log(`[${timestamp}] Body recebido:`, text);
      
      if (!text || text.trim() === '') {
        throw new Error('Body da requisição está vazio');
      }
      
      body = JSON.parse(text);
    } catch (parseError) {
      console.error(`[${timestamp}] Erro ao parsear JSON:`, parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Formato de dados inválido',
          details: 'O corpo da requisição deve ser um JSON válido'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const { endpoint, apiKey } = body;
    
    console.log(`[${timestamp}] Endpoint solicitado:`, endpoint);
    console.log(`[${timestamp}] API Key presente:`, !!apiKey);
    console.log(`[${timestamp}] API Key length:`, apiKey ? apiKey.length : 0);
    
    if (!endpoint) {
      return new Response(
        JSON.stringify({ 
          error: 'Endpoint obrigatório',
          details: 'O parâmetro "endpoint" é obrigatório'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Chave API obrigatória',
          details: 'O parâmetro "apiKey" é obrigatório'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validar formato da chave API
    if (!isValidPagarmeApiKey(apiKey)) {
      console.error(`[${timestamp}] Formato da chave API inválido`);
      return new Response(
        JSON.stringify({ 
          error: 'Formato da chave API inválido',
          details: 'A chave deve começar com "sk_test_" ou "sk_live_" e ter o formato correto da Pagar.me'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const fullUrl = `https://api.pagar.me${endpoint}`;
    console.log(`[${timestamp}] URL completa:`, fullUrl);
    
    // Usar Basic Auth conforme documentação da Pagar.me
    const basicAuthToken = encodeBasicAuth(apiKey);
    const requestHeaders = {
      'Authorization': `Basic ${basicAuthToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Lovable-Pagarme-Integration/1.0',
    };
    
    console.log(`[${timestamp}] Usando Basic Auth com API key:`, apiKey.substring(0, 15) + '...');

    console.log(`[${timestamp}] Fazendo requisição para API Pagar.me...`);
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: requestHeaders,
    });

    console.log(`[${timestamp}] Status da resposta:`, response.status);
    console.log(`[${timestamp}] Headers da resposta:`, Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log(`[${timestamp}] Resposta (texto):`, responseText.substring(0, 500));
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error(`[${timestamp}] Erro ao parsear resposta:`, e);
      data = { raw_response: responseText };
    }
    
    if (!response.ok) {
      console.error(`[${timestamp}] Erro na API Pagar.me:`, {
        status: response.status,
        data: data
      });

      let errorMessage = `Erro HTTP ${response.status}`;
      let errorDetails = data;

      // Tratar erros específicos da Pagar.me conforme documentação
      if (response.status === 401) {
        errorMessage = 'Chave da API inválida ou expirada';
        errorDetails = 'Verifique se sua chave API está correta e ativa. Use uma chave SECRET (sk_test_ ou sk_live_)';
      } else if (response.status === 403) {
        errorMessage = 'Acesso negado - Permissões insuficientes';
        errorDetails = 'Sua chave API não tem permissão para acessar este recurso';
      } else if (response.status === 404) {
        errorMessage = 'Endpoint não encontrado';
        errorDetails = 'O endpoint solicitado não existe na API Pagar.me';
      } else if (response.status === 422) {
        errorMessage = 'Dados inválidos';
        errorDetails = 'Os parâmetros enviados são inválidos';
      } else if (response.status >= 500) {
        errorMessage = 'Erro interno da API Pagar.me';
        errorDetails = 'Erro no servidor da Pagar.me. Tente novamente em alguns minutos';
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

    console.log(`[${timestamp}] === SUCESSO === Dados recebidos com sucesso`);
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error(`[${timestamp}] === ERRO CRÍTICO ===`, error);
    
    let errorMessage = 'Erro interno do servidor';
    let errorDetails = error.message;

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = 'Erro de conexão com a API Pagar.me';
      errorDetails = 'Não foi possível conectar com a API. Verifique sua conexão';
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails,
        timestamp: timestamp
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
