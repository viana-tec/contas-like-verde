
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './types.ts';
import { validateRequest } from './validation.ts';
import { parseRequestBody, makeApiRequest } from './request-handler.ts';
import { handleParseError, createErrorResponse } from './error-handler.ts';

serve(async (req) => {
  const timestamp = new Date().toISOString();
  console.log(`\n🚀 [${timestamp}] NOVA REQUISIÇÃO EDGE FUNCTION`);
  console.log(`📋 Método: ${req.method}, URL: ${req.url}`);
  console.log(`📋 Headers:`, Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log(`✅ Respondendo OPTIONS (CORS)`);
    return new Response(null, { headers: corsHeaders });
  }

  // Verificar se é POST
  if (req.method !== 'POST') {
    console.error(`❌ Método não permitido: ${req.method}`);
    return createErrorResponse(
      'Método não permitido',
      'Apenas POST é aceito',
      405,
      timestamp
    );
  }

  try {
    // Parse request body
    let body;
    try {
      body = await parseRequestBody(req);
      console.log(`✅ Body parseado com sucesso`);
    } catch (parseError) {
      console.error(`❌ Erro no parse do body:`, parseError);
      return handleParseError(parseError);
    }
    
    // Validate request
    const validation = validateRequest(body);
    if (!validation.isValid) {
      console.error(`❌ Validação falhou: ${validation.error}`);
      return createErrorResponse(
        validation.error || 'Dados inválidos',
        validation.error || 'Verifique os dados enviados',
        400,
        timestamp
      );
    }

    console.log(`✅ Validação passou, fazendo requisição para API`);

    // Make API request
    const result = await makeApiRequest(body.endpoint, body.apiKey, timestamp);
    
    console.log(`✅ Requisição completada com sucesso`);
    return result;

  } catch (error: any) {
    console.error(`💥 ERRO CRÍTICO NA EDGE FUNCTION:`, error);
    console.error(`💥 Stack trace:`, error.stack);
    
    return createErrorResponse(
      'Erro interno do servidor',
      error.message || 'Erro desconhecido na edge function',
      500,
      timestamp
    );
  }
});
