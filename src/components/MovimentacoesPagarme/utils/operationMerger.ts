/**
 * Utilitário para evitar duplicação de operações entre orders e payables
 */

import { BalanceOperation } from '../types';

export const mergeOperationsWithoutDuplicates = (
  orders: BalanceOperation[],
  payables: BalanceOperation[]
): BalanceOperation[] => {
  const result: BalanceOperation[] = [];
  const processedCodes = new Set<string>();
  
  // Priorizar orders sobre payables para evitar duplicatas
  orders.forEach(order => {
    const code = (order as any).real_code || order.id;
    if (!processedCodes.has(code)) {
      result.push(order);
      processedCodes.add(code);
    }
  });
  
  // Adicionar payables que não conflitam com orders
  payables.forEach(payable => {
    const code = (payable as any).real_code || payable.id;
    if (!processedCodes.has(code)) {
      result.push(payable);
      processedCodes.add(code);
    }
  });
  
  return result;
};