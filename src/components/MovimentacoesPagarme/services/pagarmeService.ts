
/**
 * Main service facade for Pagar.me API operations
 * Combines all service modules into a single interface
 */

// Re-export all services for backward compatibility
export { makeApiRequest, testConnection, fetchTransactionDetails } from './apiClient';
export { fetchAllDataUnlimited, fetchAllData } from './dataCollector';
export { fetchBalance } from './balanceService';

// Main service function that combines all operations
export const fetchAllDataWithBalance = async (
  apiKey: string,
  onProgress?: (stage: string, current: number, total: number, info: string) => void
) => {
  const { payablesData, transactionsData, ordersData } = await fetchAllData(apiKey, onProgress);
  
  // FASE 4: Buscar saldo
  console.log('🚀 [FASE 4] Buscando saldo atualizado...');
  const balanceData = await fetchBalance(apiKey);
  
  return {
    payablesData,
    transactionsData,
    ordersData,
    balanceData
  };
};
