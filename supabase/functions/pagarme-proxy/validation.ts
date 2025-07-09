
import { ValidationResult } from './types.ts';

export function validateApiKey(apiKey: string): ValidationResult {
  if (!apiKey || typeof apiKey !== 'string') {
    return { isValid: false, error: 'Chave API não fornecida' };
  }
  
  // Remover espaços e verificar comprimento mínimo
  const cleanKey = apiKey.trim();
  if (cleanKey.length < 10) {
    return { isValid: false, error: 'Chave API muito curta' };
  }
  
  // Verificar se contém apenas caracteres válidos (letras, números, underscore, hífen)
  const validKeyPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validKeyPattern.test(cleanKey)) {
    return { isValid: false, error: 'Formato da chave não reconhecido' };
  }

  return { isValid: true };
}

export function validateRequest(body: any): ValidationResult {
  if (!body) {
    return { isValid: false, error: 'Body vazio' };
  }

  const { endpoint, apiKey } = body;
  
  if (!endpoint) {
    return { isValid: false, error: 'Endpoint obrigatório' };
  }

  if (!apiKey) {
    return { isValid: false, error: 'Chave API obrigatória' };
  }

  const keyValidation = validateApiKey(apiKey);
  if (!keyValidation.isValid) {
    return keyValidation;
  }

  return { isValid: true };
}
