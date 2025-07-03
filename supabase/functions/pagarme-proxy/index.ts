
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
  console.log(`[${new Date().toISOString()}] Nova requisição recebida: ${req.method}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Respondendo a requisição OPTIONS (CORS preflight)');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { endpoint, apiKey } = body;
    
    console.log(`Dados recebidos: endpoint=${endpoint}, apiKey presente=${!!apiKey}`);
    
    if (!endpoint || !apiKey) {
      console.error('Erro: Endpoint ou API key ausentes');
      return new Response(
        JSON.stringify({ 
          error: 'Endpoint e API key são obrigatórios',
          details: 'Por favor, configure sua chave da API Pagar.me'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validar formato da chave API
    if (!isValidPagarmeApiKey(apiKey)) {
      console.error('Erro: Formato da chave API inválido');
      return new Response(
        JSON.stringify({ 
          error: 'Formato da chave API inválido',
          details: 'A chave deve começar com "sk_" e ter o formato correto da Pagar.me'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const fullUrl = `https://api.pagar.me${endpoint}`;
    console.log(`Fazendo requisição para: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Lovable-Pagarme-Integration/1.0',
      },
    });

    console.log(`Resposta recebida da API Pagar.me: Status ${response.status}`);

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Erro na resposta da API Pagar.me:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });

      let errorMessage = `Erro HTTP ${response.status}`;
      let errorDetails = data;

      // Tratar erros específicos da Pagar.me
      if (response.status === 401) {
        errorMessage = 'Chave da API inválida ou sem permissões';
        errorDetails = 'Verifique se sua chave API está correta e tem as permissões necessárias';
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
          status: response.status
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Dados recebidos com sucesso da API Pagar.me');
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Erro na Edge Function:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    let errorMessage = 'Erro interno do servidor';
    let errorDetails = error.message;

    // Tratar diferentes tipos de erro
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = 'Erro de conexão com a API Pagar.me';
      errorDetails = 'Verifique sua conexão com a internet e tente novamente';
    } else if (error.message.includes('JSON')) {
      errorMessage = 'Erro ao processar dados';
      errorDetails = 'Dados inválidos recebidos na requisição';
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
