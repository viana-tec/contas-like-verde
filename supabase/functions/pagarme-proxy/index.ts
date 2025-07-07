
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validação robusta da chave API Pagar.me
function isValidPagarmeApiKey(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  
  // Remover espaços e verificar comprimento mínimo
  const cleanKey = apiKey.trim();
  if (cleanKey.length < 10) {
    return false;
  }
  
  // Verificar se contém apenas caracteres válidos (letras, números, underscore, hífen)
  const validKeyPattern = /^[a-zA-Z0-9_-]+$/;
  return validKeyPattern.test(cleanKey);
}

serve(async (req) => {
  const timestamp = new Date().toISOString();
  console.log(`\n🚀 [${timestamp}] NOVA REQUISIÇÃO EDGE FUNCTION`);
  console.log(`📋 Método: ${req.method}, URL: ${req.url}`);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log(`✅ Respondendo OPTIONS (CORS)`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse body
    let body;
    try {
      const text = await req.text();
      console.log(`📝 Body recebido (${text.length} chars):`, text.substring(0, 200));
      
      if (!text?.trim()) {
        throw new Error('Body vazio');
      }
      
      body = JSON.parse(text);
      console.log(`✅ Body parseado:`, { 
        hasEndpoint: !!body.endpoint, 
        hasApiKey: !!body.apiKey,
        keyLength: body.apiKey?.length || 0 
      });
    } catch (parseError) {
      console.error(`💥 Erro no parse:`, parseError);
      return new Response(
        JSON.stringify({ 
          error: 'JSON inválido',
          details: 'Corpo da requisição deve ser JSON válido'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { endpoint, apiKey } = body;
    
    // Validações
    if (!endpoint) {
      console.error(`❌ Endpoint não fornecido`);
      return new Response(
        JSON.stringify({ error: 'Endpoint obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!apiKey) {
      console.error(`❌ API Key não fornecida`);
      return new Response(
        JSON.stringify({ error: 'Chave API obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isValidPagarmeApiKey(apiKey)) {
      console.error(`❌ Chave API inválida`);
      return new Response(
        JSON.stringify({ 
          error: 'Chave API inválida',
          details: 'Formato da chave não reconhecido'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Construir URL
    const baseUrl = 'https://api.pagar.me';
    const fullUrl = `${baseUrl}${endpoint}`;
    console.log(`🌐 URL construída: ${fullUrl}`);
    
    // Headers da requisição
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
        return new Response(
          JSON.stringify({ 
            error: 'Resposta inválida da API',
            details: 'API não retornou JSON válido'
          }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!response.ok) {
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

        return new Response(
          JSON.stringify({ 
            error: errorMessage,
            details: errorDetails,
            status: response.status,
            timestamp: timestamp
          }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`🎉 SUCESSO! Dados recebidos`);
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error(`⏰ Timeout na requisição`);
        return new Response(
          JSON.stringify({ 
            error: 'Timeout',
            details: 'Requisição demorou mais que 25 segundos'
          }),
          { status: 408, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.error(`💥 Erro na requisição:`, fetchError);
      throw fetchError;
    }

  } catch (error: any) {
    console.error(`💥 ERRO CRÍTICO:`, error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno',
        details: error.message || 'Erro desconhecido',
        timestamp: timestamp
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
