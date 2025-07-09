
import { ValidationResult, PagarmeProxyRequest } from './types.ts';

export function validateRequest(body: any): ValidationResult {
  console.log(`🔍 [VALIDATION] Validando requisição...`);
  
  if (!body) {
    console.error(`❌ [VALIDATION] Body está vazio`);
    return {
      isValid: false,
      error: 'Body da requisição é obrigatório'
    };
  }

  if (!body.endpoint) {
    console.error(`❌ [VALIDATION] Endpoint não fornecido`);
    return {
      isValid: false,
      error: 'Parâmetro endpoint é obrigatório'
    };
  }

  if (!body.apiKey) {
    console.error(`❌ [VALIDATION] ApiKey não fornecida`);
    return {
      isValid: false,
      error: 'Parâmetro apiKey é obrigatório'
    };
  }

  if (typeof body.endpoint !== 'string') {
    console.error(`❌ [VALIDATION] Endpoint deve ser string`);
    return {
      isValid: false,
      error: 'Endpoint deve ser uma string'
    };
  }

  if (typeof body.apiKey !== 'string') {
    console.error(`❌ [VALIDATION] ApiKey deve ser string`);
    return {
      isValid: false,
      error: 'ApiKey deve ser uma string'
    };
  }

  // Validar formato do endpoint
  const endpoint = body.endpoint.trim();
  if (!endpoint.startsWith('/core/v5/')) {
    console.error(`❌ [VALIDATION] Endpoint inválido: ${endpoint}`);
    return {
      isValid: false,
      error: 'Endpoint deve começar com /core/v5/'
    };
  }

  // Validar formato da API key
  const apiKey = body.apiKey.trim();
  if (!apiKey.startsWith('sk_') && !apiKey.startsWith('ak_')) {
    console.error(`❌ [VALIDATION] ApiKey com formato inválido`);
    return {
      isValid: false,
      error: 'ApiKey deve começar com sk_ ou ak_'
    };
  }

  if (apiKey.length < 20) {
    console.error(`❌ [VALIDATION] ApiKey muito curta`);
    return {
      isValid: false,
      error: 'ApiKey parece estar incompleta'
    };
  }

  console.log(`✅ [VALIDATION] Validação passou`);
  return {
    isValid: true
  };
}
