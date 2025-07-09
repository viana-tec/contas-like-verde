/**
 * Utilitário para remover duplicatas de operações e garantir integridade dos dados
 */

import { BalanceOperation } from '../types';

export const deduplicateOperations = (operations: BalanceOperation[]): BalanceOperation[] => {
  const seen = new Set<string>();
  const result: BalanceOperation[] = [];
  
  for (const operation of operations) {
    // Usar múltiplos critérios para identificar duplicatas
    const key = [
      (operation as any).real_code || operation.id,
      operation.amount,
      operation.created_at,
      operation.payment_method
    ].join('|');
    
    if (!seen.has(key)) {
      seen.add(key);
      result.push(operation);
    }
  }
  
  return result;
};

export const validateOperationIntegrity = (operations: BalanceOperation[]): {
  isValid: boolean;
  duplicates: string[];
  missingCodes: string[];
} => {
  const codes = new Set<string>();
  const duplicates: string[] = [];
  const missingCodes: string[] = [];
  
  operations.forEach((operation, index) => {
    const code = (operation as any).real_code || operation.id;
    
    if (!code) {
      missingCodes.push(`Operação ${index}: sem código`);
    } else if (codes.has(code)) {
      duplicates.push(code);
    } else {
      codes.add(code);
    }
  });
  
  return {
    isValid: duplicates.length === 0 && missingCodes.length === 0,
    duplicates,
    missingCodes
  };
};