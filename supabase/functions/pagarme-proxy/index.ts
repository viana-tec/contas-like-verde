
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função para validar chave API Pagar.me baseada na documentação oficial
function isValidPagarmeApiKey(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  
  // Pagar.me aceita diferentes formatos de chave
  // Verificar se tem pelo menos 20 caracteres e não está vazia
  return apiKey.length >= 20 && apiKey.trim() !== '';
}

serve(async (req) => {
  const timestamp = new Date().toISOString();
  console.log(`\n🚀 [${timestamp}] === NOVA REQUISIÇÃO EDGE FUNCTION ===`);
  console.log(`📋 [${timestamp}] Método: ${req.method}`);
  console.log(`🌐 [${timestamp}] URL: ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`✅ [${timestamp}] Respondendo a requisição OPTIONS (CORS preflight)`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar se há body na requisição
    let body;
    try {
      const text = await req.text();
      console.log(`📝 [${timestamp}] Body bruto recebido:`, text);
      
      if (!text || text.trim() === '') {
        console.error(`❌ [${timestamp}] Body da requisição está vazio`);
        return new Response(
          JSON.stringify({ 
            error: 'Body da requisição está vazio',
            details: 'O corpo da requisição deve ser um JSON válido'
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      body = JSON.parse(text);
      console.log(`✅ [${timestamp}] Body parseado com sucesso:`, body);
    } catch (parseError) {
      console.error(`💥 [${timestamp}] Erro ao parsear JSON:`, parseError);
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
    
    console.log(`🎯 [${timestamp}] Endpoint solicitado:`, endpoint);
    console.log(`🔑 [${timestamp}] API Key presente:`, !!apiKey);
    console.log(`📏 [${timestamp}] API Key length:`, apiKey ? apiKey.length : 0);
    
    if (!endpoint) {
      console.error(`❌ [${timestamp}] Endpoint não fornecido`);
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
      console.error(`❌ [${timestamp}] API Key não fornecida`);
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
      console.error(`❌ [${timestamp}] Formato da chave API inválido`);
      return new Response(
        JSON.stringify({ 
          error: 'Formato da chave API inválido',
          details: 'A chave deve ter pelo menos 20 caracteres'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const fullUrl = `https://api.pagar.me${endpoint}`;
    console.log(`🌐 [${timestamp}] URL completa construída:`, fullUrl);
    
    // Usar Basic Auth conforme documentação da Pagar.me
    const basicAuthCredentials = btoa(`${apiKey}:`);
    console.log(`🔐 [${timestamp}] Basic Auth criado`);
    
    const requestHeaders = {
      'Authorization': `Basic ${basicAuthCredentials}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Lovable-Pagarme-Integration/2.0',
    };
    
    console.log(`📤 [${timestamp}] Fazendo requisição para:`, fullUrl);

    // Fazer requisição com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: requestHeaders,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📥 [${timestamp}] Resposta recebida - Status:`, response.status);
      console.log(`📋 [${timestamp}] Response headers:`, Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log(`📄 [${timestamp}] Response body:`, responseText.substring(0, 500));
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log(`✅ [${timestamp}] Response parseado com sucesso`);
      } catch (e) {
        console.error(`⚠️ [${timestamp}] Erro ao parsear response JSON:`, e);
        return new Response(
          JSON.stringify({ 
            error: 'Resposta inválida da API',
            details: 'A API retornou uma resposta que não é JSON válido',
            raw_response: responseText
          }),
          { 
            status: 502, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (!response.ok) {
        console.error(`❌ [${timestamp}] Erro na API Pagar.me:`, {
          status: response.status,
          statusText: response.statusText,
          data: data
        });

        let errorMessage = `Erro HTTP ${response.status}`;
        let errorDetails = 'Erro desconhecido da API Pagar.me';

        // Tratar erros específicos da Pagar.me
        if (response.status === 401) {
          errorMessage = 'Chave da API inválida ou expirada';
          errorDetails = 'Verifique se sua chave API está correta e ativa no dashboard da Pagar.me';
        } else if (response.status === 403) {
          errorMessage = 'Acesso negado - Permissões insuficientes';
          errorDetails = 'Sua chave API não tem permissão para acessar este recurso';
        } else if (response.status === 404) {
          errorMessage = 'Endpoint não encontrado';
          errorDetails = 'O endpoint solicitado não existe na API Pagar.me';
        } else if (response.status === 422) {
          errorMessage = 'Parâmetros inválidos';
          errorDetails = data?.message || 'Os parâmetros enviados são inválidos';
          
          // Log detalhado para erro 422
          if (data?.errors) {
            console.log(`🔍 [${timestamp}] Detalhes do erro 422:`, data.errors);
            errorDetails += `. Detalhes: ${JSON.stringify(data.errors)}`;
          }
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
              responseData: data,
              timestamp: timestamp
            }
          }),
          { 
            status: response.status, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log(`🎉 [${timestamp}] === SUCESSO === Dados recebidos da Pagar.me`);
      
      return new Response(
        JSON.stringify(data),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error(`⏰ [${timestamp}] Timeout na requisição para Pagar.me`);
        return new Response(
          JSON.stringify({ 
            error: 'Timeout na conexão',
            details: 'A requisição para a API Pagar.me demorou mais que 30 segundos'
          }),
          { 
            status: 408, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      throw fetchError;
    }

  } catch (error: any) {
    console.error(`💥 [${timestamp}] === ERRO CRÍTICO ===`, error);
    
    let errorMessage = 'Erro interno do servidor';
    let errorDetails = error.message;

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = 'Erro de conexão com a API Pagar.me';
      errorDetails = 'Não foi possível conectar com a API. Verifique sua conexão de internet';
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
