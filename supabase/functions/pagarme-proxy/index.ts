
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './types.ts';
import { validateRequest } from './validation.ts';
import { parseRequestBody, makeApiRequest } from './request-handler.ts';
import { handleParseError, createErrorResponse } from './error-handler.ts';

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
    // Parse request body
    let body;
    try {
      body = await parseRequestBody(req);
    } catch (parseError) {
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

    // Make API request
    return await makeApiRequest(body.endpoint, body.apiKey, timestamp);

  } catch (error: any) {
    console.error(`💥 ERRO CRÍTICO:`, error);
    
    return createErrorResponse(
      'Erro interno',
      error.message || 'Erro desconhecido',
      500,
      timestamp
    );
  }
});
